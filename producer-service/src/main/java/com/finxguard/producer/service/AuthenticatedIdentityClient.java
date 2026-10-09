package com.finxguard.producer.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthenticatedIdentityClient {

    private final RestClient backendClient;

    public AuthenticatedIdentityClient(
            @Value("${finxguard.backend.url:http://localhost:8080}") String backendUrl) {
        backendClient = RestClient.builder().baseUrl(backendUrl).build();
    }

    public UserIdentity requireUser(String authorizationHeader, String expectedRole) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        try {
            UserIdentity user = backendClient.get()
                    .uri("/api/auth/me")
                    .header("Authorization", authorizationHeader)
                    .retrieve()
                    .body(UserIdentity.class);
            if (user == null) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid session");
            }
            if (!expectedRole.equals(user.role())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
            }
            return user;
        } catch (RestClientResponseException ex) {
            throw new ResponseStatusException(
                    ex.getStatusCode().is4xxClientError() ? ex.getStatusCode() : HttpStatus.SERVICE_UNAVAILABLE,
                    "Unable to verify the FinXGuard session");
        }
    }

    public record UserIdentity(String id, String name, String email, String role) {
    }
}
