package com.cocreadores.backend.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component("customCorsFilter")
@Slf4j
public class CorsFilter extends OncePerRequestFilter {

    private final String frontendUrl;

    public CorsFilter(@Value("${frontend.url}") String frontendUrl) {
        this.frontendUrl = frontendUrl;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest httpRequest, HttpServletResponse httpResponse, FilterChain chain) throws ServletException, IOException {

        String requestHeader = httpResponse.getHeader("Access-Control-Request-Headers");
        httpResponse.setHeader("Access-Control-Allow-Origin", frontendUrl);
        httpResponse.addHeader("Access-Control-Allow-Methods", "GET, PUT, POST, OPTIONS, DELETE");
        httpResponse.addHeader("Access-Control-Allow-Headers", requestHeader);
        httpResponse.addHeader("Access-Control-Max-Age", "86400");

        chain.doFilter(httpRequest, httpResponse);
    }

}