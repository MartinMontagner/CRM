package com.cocreadores.backend.filter;

import com.cocreadores.backend.constant.CustomHeaders;
import com.cocreadores.backend.http.RequestWrapper;
import com.cocreadores.backend.model.user.AccessTokenData;
import com.cocreadores.backend.service.auth.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public class AuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final String securityApiSecret;

    public AuthFilter(JwtService jwtService, String securityApiSecret){
        this.jwtService = jwtService;
        this.securityApiSecret = securityApiSecret;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        RequestWrapper requestWrapper = new RequestWrapper(request);
        requestWrapper.addHeader(CustomHeaders.USER_ID, "-1");

        final String apiSecretHeader = request.getHeader("API-Secret");
        if (apiSecretHeader != null && apiSecretHeader.equals(securityApiSecret)) {
            AnonymousAuthenticationToken authentication = new AnonymousAuthenticationToken("api", "api", List.of(new SimpleGrantedAuthority("ROLE_API_SECRET")));
            SecurityContextHolder.getContext().setAuthentication(authentication);
            filterChain.doFilter(request, response);
            return;
        }

        String authorizationHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if(authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")){
            filterChain.doFilter(requestWrapper, response);
            return;
        }

        String token = authorizationHeader.substring("Bearer ".length());
        Optional<AccessTokenData> accessTokenDataOpt = jwtService.getDataFromAccessToken(token);
        if(accessTokenDataOpt.isEmpty()){
            filterChain.doFilter(requestWrapper, response);
            return;
        }
        AccessTokenData accessTokenData = accessTokenDataOpt.get();

        Collection<GrantedAuthority> authorities = accessTokenData.roles().stream().map(role -> (GrantedAuthority) new SimpleGrantedAuthority("ROLE_" + role)).toList();
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(accessTokenData.userId(), null, authorities);
        SecurityContextHolder.getContext().setAuthentication(authenticationToken);

        requestWrapper.addHeader(CustomHeaders.USER_ID, String.valueOf(accessTokenData.userId()));

        filterChain.doFilter(requestWrapper, response);
    }
}