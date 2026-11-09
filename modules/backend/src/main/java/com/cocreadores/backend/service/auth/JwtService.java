package com.cocreadores.backend.service.auth;

import com.cocreadores.backend.model.user.AccessTokenData;
import com.cocreadores.backend.model.user.RefreshTokenData;
import com.cocreadores.backend.model.user.Role;
import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Arrays;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Slf4j
public class JwtService {

    private static final Duration ACCESS_TOKEN_DURATION = Duration.ofMinutes(1);
    private static final Duration REFRESH_TOKEN_DURATION = Duration.ofDays(7);
    private final String jwtSecret;

    public JwtService(@Value("${security.jwt.secret}") String jwtSecret) {
        this.jwtSecret = jwtSecret;
    }

    public Instant generateAccessTokenExpiresAt(){
        return Instant.ofEpochMilli(System.currentTimeMillis() + ACCESS_TOKEN_DURATION.toMillis());
    }

    public Optional<String> generateAccessToken(AccessTokenData data) {
        return generateAccessToken(data, generateAccessTokenExpiresAt());
    }

    public Optional<String> generateAccessToken(AccessTokenData data, Instant expiresAt) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(jwtSecret.getBytes());
            return Optional.of(JWT.create()
                    .withSubject(data.userId().toString())
                    .withClaim("roles", data.roles().stream().map(Role::name).toList())
                    .withExpiresAt(expiresAt)
                    .sign(algorithm));
        } catch (Exception e) {
            log.error("Generating access token", e);
            return Optional.empty();
        }
    }

    public Instant generateRefreshTokenExpiresAt(){
        return Instant.ofEpochMilli(System.currentTimeMillis() + REFRESH_TOKEN_DURATION.toMillis());
    }

    public Optional<String> generateRefreshToken(RefreshTokenData data) {
        return generateRefreshToken(data, generateRefreshTokenExpiresAt());
    }

    public Optional<String> generateRefreshToken(RefreshTokenData data, Instant expiresAt) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(jwtSecret.getBytes());
            return Optional.of(JWT.create()
                    .withSubject(data.userId().toString())
                    .withExpiresAt(expiresAt)
                    .sign(algorithm));
        } catch (Exception e) {
            log.error("Generating refresh token", e);
            return Optional.empty();
        }
    }

    public Optional<AccessTokenData> getDataFromAccessToken(String accessToken) {
        return verifyJwtToken(accessToken).flatMap(this::extractDataFromAccessToken);
    }

    public Optional<AccessTokenData> getDataFromAccessTokenWithoutValidation(String accessToken) {
        return decodeJwtTokenWithoutValidation(accessToken).flatMap(this::extractDataFromAccessToken);
    }

    public Optional<RefreshTokenData> getDataFromRefreshToken(String refreshToken) {
        return verifyJwtToken(refreshToken).flatMap(this::extractDataFromRefreshToken);
    }

    public Optional<RefreshTokenData> getDataFromRefreshTokenWithoutValidation(String refreshToken) {
        return decodeJwtTokenWithoutValidation(refreshToken).flatMap(this::extractDataFromRefreshToken);
    }

    private Optional<DecodedJWT> verifyJwtToken(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(jwtSecret.getBytes());
            JWTVerifier verifier = JWT.require(algorithm).build();
            return Optional.of(verifier.verify(token));
        } catch (com.auth0.jwt.exceptions.TokenExpiredException e) {
            log.warn("El token ha expirado: {}", e.getMessage()); // Log más visible y breve
            return Optional.empty();
        } catch (Exception e) {
            log.error("Error verificando el token JWT: {}", e.getMessage()); // Mensaje breve para otros errores
            return Optional.empty();
        }
    }

    private Optional<DecodedJWT> decodeJwtTokenWithoutValidation(String token){
        try {
            return Optional.of(JWT.decode(token));
        } catch (Exception e) {
            log.error("Decoding JWT token");
            return Optional.empty();
        }
    }

    private Optional<AccessTokenData> extractDataFromAccessToken(DecodedJWT accessToken){
        try{
            Long userId = Long.valueOf(accessToken.getSubject());
            Set<Role> roles = Arrays.stream(accessToken.getClaim("roles").asArray(String.class)).map(Role::valueOf).collect(Collectors.toSet());
            return Optional.of(new AccessTokenData(userId, roles));
        } catch (Exception e) {
            log.error("Extracting data from access token", e);
            return Optional.empty();
        }
    }

    private Optional<RefreshTokenData> extractDataFromRefreshToken(DecodedJWT refreshToken){
        try{
            Long userId = Long.valueOf(refreshToken.getSubject());
            return Optional.of(new RefreshTokenData(userId));
        } catch (Exception e) {
            log.error("Extracting data from refresh token", e);
            return Optional.empty();
        }
    }

    public Optional<Long> getUserIdFromAccessToken(String accessToken) {
        return getDataFromAccessToken(accessToken).map(AccessTokenData::userId);
    }
}