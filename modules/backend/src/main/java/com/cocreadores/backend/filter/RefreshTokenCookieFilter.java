package com.cocreadores.backend.filter;

import com.cocreadores.backend.constant.AuthConstants;
import com.cocreadores.backend.http.RequestWrapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.Optional;

@Component
public class RefreshTokenCookieFilter extends OncePerRequestFilter {

    private final String jwtCookieName;

    public RefreshTokenCookieFilter(@Value("${security.jwt.cookie.name}") String jwtCookieName) {
        this.jwtCookieName = jwtCookieName;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        Optional<Cookie> refreshTokenCookieOpt = getAuthTokenCookie(request);
        if(refreshTokenCookieOpt.isEmpty()){
            filterChain.doFilter(request, response);
            return;
        }
        Cookie refreshTokenCookie = refreshTokenCookieOpt.get();

        RequestWrapper requestWrapper = new RequestWrapper(request);

        Cookie newCookie = new Cookie(AuthConstants.REFRESH_COOKIE_NAME, refreshTokenCookie.getValue());
        newCookie.setDomain(refreshTokenCookie.getDomain());
        newCookie.setPath(refreshTokenCookie.getPath());
        newCookie.setSecure(refreshTokenCookie.getSecure());
        newCookie.setHttpOnly(refreshTokenCookie.isHttpOnly());
        newCookie.setMaxAge(refreshTokenCookie.getMaxAge());
        refreshTokenCookie.getAttributes().forEach(newCookie::setAttribute);

        requestWrapper.addCookie(newCookie);
        filterChain.doFilter(requestWrapper, response);
    }

    private Optional<Cookie> getAuthTokenCookie(HttpServletRequest request){
        Cookie[] cookies;
        try {
            cookies = request.getCookies();
        }catch (NullPointerException e){
            return Optional.empty();
        }
        if(cookies == null){
            return Optional.empty();
        }
        return Arrays.stream(cookies).filter(cookie -> jwtCookieName.equals(cookie.getName())).findFirst();
    }
}