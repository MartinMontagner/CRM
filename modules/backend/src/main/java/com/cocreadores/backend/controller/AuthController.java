package com.cocreadores.backend.controller;

import com.cocreadores.backend.constant.AuthConstants;
import com.cocreadores.backend.dto.auth.AuthDataDTO;
import com.cocreadores.backend.exception.AuthenticationException;
import com.cocreadores.backend.exception.InvalidRequestException;
import com.cocreadores.backend.exception.UnexpectedException;
import com.cocreadores.backend.service.auth.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;


import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(allowCredentials = "true", originPatterns = "*")
@PreAuthorize("permitAll()")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }


    public record LoginRequest(String email, String password) {}
    @PostMapping("/login")
    public ResponseEntity<AuthDataDTO> login(@RequestBody LoginRequest credentials,
                                             HttpServletRequest request,
                                             HttpServletResponse response)
            throws AuthenticationException, UnexpectedException {
        return ResponseEntity.ok(authService.login(credentials.email(), credentials.password(), request, response));
    }

    public record CreateUserRequest(String email, String username, String fullName, String password){}
    @PostMapping("/signup")
    public ResponseEntity<AuthDataDTO> signup(@RequestBody CreateUserRequest body, HttpServletRequest request, HttpServletResponse response ) throws InvalidRequestException, UnexpectedException {
        return ResponseEntity.ok(authService.signup(body.email(), body.username(), body.fullName(), body.password(), request, response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthDataDTO> refresh(@CookieValue(name = AuthConstants.REFRESH_COOKIE_NAME, required = false) String refreshToken) throws AuthenticationException, UnexpectedException {
        if(refreshToken == null){
            throw new AuthenticationException("MISSING_REFRESH_TOKEN");
        }
        return ResponseEntity.ok(authService.refresh(refreshToken));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@CookieValue(name = "REFRESH_TOKEN", required = false) String refreshToken, HttpServletResponse response){
        if(refreshToken != null){
            authService.logout(refreshToken, response);
        }
        return ResponseEntity.ok().build();
    }

}