package com.cocreadores.backend.service.auth;

import com.cocreadores.backend.dto.auth.AuthDataDTO;
import com.cocreadores.backend.exception.AuthenticationException;
import com.cocreadores.backend.exception.InvalidRequestException;
import com.cocreadores.backend.exception.UnexpectedException;
import com.cocreadores.backend.model.user.*;
import com.cocreadores.backend.model.user.Role.RoleDescription;
import com.cocreadores.backend.service.logs.AuditLogService;
import com.cocreadores.backend.service.user.RefreshTokenEntityService;
import com.cocreadores.backend.service.user.UserEntityService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static com.cocreadores.backend.model.log.AuditAction.LOGIN;
import static java.time.temporal.ChronoUnit.SECONDS;

@Service
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserEntityService userEntityService;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenEntityService refreshTokenEntityService;
    private final String jwtCookieName;
    private final String jwtCookieDomain;
    private final boolean jwtCookieSecure;
    private final AuditLogService auditLogService;


    public AuthService(AuthenticationManager authenticationManager,
                       JwtService jwtService,
                       UserEntityService userEntityService,
                       PasswordEncoder passwordEncoder,
                       RefreshTokenEntityService refreshTokenEntityService,
                       @Value("${security.jwt.cookie.name}") String jwtCookieName,
                       @Value("${security.jwt.cookie.domain}") String jwtCookieDomain,
                       @Value("${security.jwt.cookie.secure}") boolean jwtCookieSecure, AuditLogService auditLogService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userEntityService = userEntityService;
        this.passwordEncoder = passwordEncoder;
        this.refreshTokenEntityService = refreshTokenEntityService;
        this.jwtCookieName = jwtCookieName;
        this.jwtCookieDomain = jwtCookieDomain;
        this.jwtCookieSecure = jwtCookieSecure;
        this.auditLogService = auditLogService;
    }


    public AuthDataDTO login(String email, String password, HttpServletRequest request, HttpServletResponse response)
            throws AuthenticationException, UnexpectedException {

        // Primero verificar si el usuario existe
        Optional<UserEntity> userOpt = userEntityService.findByEmail(email);
        if (userOpt.isEmpty()) {
            throw new AuthenticationException("BAD_CREDENTIALS");
        }

        UserEntity user = userOpt.get();

        // Verificar si el usuario está deshabilitado
        if (user.isDisabled()) {
            throw new AuthenticationException("USER_DISABLED");
        }

        // Verificar si el usuario no está aprobado
        if (!user.isEnabled()) {
            throw new AuthenticationException("USER_NOT_APPROVED");
        }

        // Validar contraseña
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new AuthenticationException("BAD_CREDENTIALS");
        }

        return login(user, request, response);
    }


    private AuthDataDTO login(UserEntity user, HttpServletRequest request, HttpServletResponse response)
            throws UnexpectedException {
        Instant refreshExpiresAt = jwtService.generateRefreshTokenExpiresAt();
        String refreshToken = jwtService.generateRefreshToken(new RefreshTokenData(user.getId()), refreshExpiresAt).orElseThrow(() -> new UnexpectedException("JWT_ERROR"));
        if (refreshTokenEntityService.saveOrUpdate(new RefreshTokenEntity(refreshToken, refreshExpiresAt, user)).isEmpty()) {
            throw new UnexpectedException("DB_ERROR");
        }
        setRefreshTokenCookie(response, refreshToken, refreshExpiresAt);

        String accessToken = jwtService.generateAccessToken(new AccessTokenData(user.getId(), user.getRoles())).orElseThrow(() -> new UnexpectedException("JWT_ERROR"));

        auditLogService.logAction(
                LOGIN,
                "Usuario " + user.getEmail() + " inició sesión.",
                request
        );

        return new AuthDataDTO(accessToken, user.getRoles());
    }


    public AuthDataDTO refresh(String token) throws AuthenticationException, UnexpectedException {
        RefreshTokenEntity refreshTokenEntity = refreshTokenEntityService.findByToken(token).orElseThrow(() -> new AuthenticationException("TOKEN_EXPIRED"));
        if (refreshTokenEntity.isExpired()) {
            refreshTokenEntityService.delete(refreshTokenEntity);
            throw new AuthenticationException("TOKEN_EXPIRED");
        }
        UserEntity user = Optional.ofNullable(refreshTokenEntity.getUser()).orElseThrow(() -> new UnexpectedException("DB_ERROR"));
        String accessToken = jwtService.generateAccessToken(new AccessTokenData(user.getId(), user.getRoles())).orElseThrow(() -> new UnexpectedException("JWT_ERROR"));
        return new AuthDataDTO(accessToken, user.getRoles());
    }

    public AuthDataDTO signup(String email, String username, String fullName, String password, HttpServletRequest request, HttpServletResponse response) throws InvalidRequestException, UnexpectedException {
        if (userEntityService.findByEmail(email).isPresent()) {
            throw new InvalidRequestException("EMAIL_IN_USE");
        }

        if (userEntityService.findByUsername(username).isPresent()) {
            throw new InvalidRequestException("USERNAME_IN_USE");
        }

        /*if (userEntityService.findByName(fullName).isPresent()) {
            throw new InvalidRequestException("NAME_IN_USE");
        }*/

        // TODO validate password;
        UserEntity user = new UserEntity(email, username, fullName, passwordEncoder.encode(password), Set.of(Role.USER), false);

        user = userEntityService.saveOrUpdate(user);

        return login(user, request, response);
    }

    public void logout(String refreshToken, HttpServletResponse response) {
        refreshTokenEntityService.deleteByToken(refreshToken);
        setRefreshTokenCookie(response, "DELETED", null);
    }

    private Optional<UserEntity> validateCredentials(String email, String password) {
        try {
            Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
            UserEntity user = ((CustomUserDetails) authentication.getPrincipal()).getAppUser();
            return Optional.ofNullable(user);
        } catch (BadCredentialsException e) {
            log.debug("Wrong credentials log in attempt, account: " + email);
        } catch (ClassCastException e) {
            log.warn("Casting authentication principal to CustomUserDetails in log in attempt, account: " + email, e);
        }
        return Optional.empty();
    }

    private void setRefreshTokenCookie(HttpServletResponse response, String token, Instant expiresAt) {
        try {
            Cookie cookie = new Cookie(jwtCookieName, token);
            cookie.setPath("/");
            cookie.setMaxAge(expiresAt == null ? 0 : (int) SECONDS.between(Instant.now(), expiresAt));
            cookie.setHttpOnly(true);
            cookie.setDomain(jwtCookieDomain);
            if (jwtCookieSecure) {
                cookie.setSecure(true);
            }
            response.addCookie(cookie);
        } catch (Exception e) {
            log.error("Setting refresh token cookie", e);
        }
    }

}