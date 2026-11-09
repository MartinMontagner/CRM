package com.cocreadores.backend.config;

import com.cocreadores.backend.model.user.AccessTokenData;
import com.cocreadores.backend.service.auth.JwtService;
import com.cocreadores.backend.service.user.UserEntityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserEntityService userEntityService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null) {
            // Handle CONNECT (initial connection)
            if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                return handleConnect(message, accessor);
            }
            // Handle SUBSCRIBE (channel subscriptions)
            else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
                return handleSubscribe(message, accessor);
            }
            // Handle SEND (message sending)
            else if (StompCommand.SEND.equals(accessor.getCommand())) {
                return handleSend(message, accessor);
            }
        }

        return message;
    }

    private Message<?> handleConnect(Message<?> message, StompHeaderAccessor accessor) {
        List<String> authorization = accessor.getNativeHeader("Authorization");

        if (authorization == null || authorization.isEmpty()) {
            throw new MessagingException("Authorization header missing");
        }

        String bearerToken = authorization.get(0);
        String token = bearerToken.startsWith("Bearer ") ? bearerToken.substring(7) : bearerToken;

        try {
            Optional<AccessTokenData> tokenData = jwtService.getDataFromAccessToken(token);

            if (tokenData.isEmpty()) {
                throw new MessagingException("Invalid token");
            }

            Long userId = tokenData.get().userId();
            UserDetails userDetails = userEntityService.getUser(userId);

            if (userDetails == null) {
                throw new MessagingException("User not found");
            }

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities());

            accessor.setUser(authentication);
            return message;

        } catch (Exception e) {
            throw new MessagingException("Authentication failed: " + e.getMessage());
        }
    }

    private Message<?> handleSubscribe(Message<?> message, StompHeaderAccessor accessor) {
        // Add additional subscription validation if needed
        return message;
    }

    private Message<?> handleSend(Message<?> message, StompHeaderAccessor accessor) {
        // Validate message sending permissions
        return message;
    }
}