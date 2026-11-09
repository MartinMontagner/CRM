package com.cocreadores.backend.http;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;

import java.util.*;

public class RequestWrapper extends HttpServletRequestWrapper {

    private final Map<String, String> headerMap = new HashMap<>();
    private List<Cookie> cookies = new ArrayList<>();

    public RequestWrapper(HttpServletRequest request) {
        super(request);
    }

    public void addHeader(String name, String value) {
        headerMap.put(name, value);
    }

    public void addCookie(Cookie cookie){
        cookies.add(cookie);
    }

    @Override
    public String getHeader(String name) {
        String headerValue = super.getHeader(name);
        if (headerMap.containsKey(name)) {
            headerValue = headerMap.get(name);
        }
        return headerValue;
    }

    @Override
    public Enumeration<String> getHeaderNames() {
        List<String> names = Collections.list(super.getHeaderNames());
        names.addAll(headerMap.keySet());
        return Collections.enumeration(names);
    }

    @Override
    public Enumeration<String> getHeaders(String name) {
        List<String> values = Collections.list(super.getHeaders(name));
        if (headerMap.containsKey(name)) {
            values.add(headerMap.get(name));
        }
        return Collections.enumeration(values);
    }

    @Override
    public Cookie[] getCookies(){
        Map<String, Cookie> cookieMap = new HashMap<>();
        if(super.getCookies() != null){
            Arrays.stream(super.getCookies()).forEachOrdered(cookie -> cookieMap.put(cookie.getName(), cookie));
        }
        cookies.forEach(cookie -> cookieMap.put(cookie.getName(), cookie));
        return cookieMap.values().toArray(new Cookie[0]);
    }

}