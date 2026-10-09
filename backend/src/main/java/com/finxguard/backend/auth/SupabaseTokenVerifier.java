package com.finxguard.backend.auth;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class SupabaseTokenVerifier {

    private final String supabaseUrl;
    private final String publishableKey;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public SupabaseTokenVerifier(
            @Value("${finxguard.supabase.url}") String supabaseUrl,
            @Value("${finxguard.supabase.publishable-key}") String publishableKey,
            ObjectMapper objectMapper) {

        this.supabaseUrl = supabaseUrl.replaceAll("/+$", "");
        this.publishableKey = publishableKey;
        this.objectMapper = objectMapper != null ? objectMapper : new ObjectMapper();

        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
    }

    public SupabaseUser verify(String accessToken) {
        if (accessToken == null || accessToken.isBlank()) {
            throw unauthorized();
        }

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(supabaseUrl + "/auth/v1/user"))
                    .timeout(Duration.ofSeconds(10))
                    .header("apikey", publishableKey)
                    .header("Authorization", "Bearer " + accessToken)
                    .header("Accept", "application/json")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(
                    request,
                    HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw unauthorized();
            }

            JsonNode json = objectMapper.readTree(response.body());

            String id = text(json, "id");
            String email = text(json, "email");

            if (id == null || email == null) {
                throw unauthorized();
            }

            String confirmedAt = text(json, "email_confirmed_at");

            // Email confirmation required for this application.
            if (confirmedAt == null) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Please verify your email first.");
            }

            String name = null;
            String role = null;
            JsonNode metadata = json.path("user_metadata");

            if (!metadata.isMissingNode()) {
                name = text(metadata, "full_name");

                if (name == null) {
                    name = text(metadata, "name");
                }
                role = text(metadata, "role");
            }

            return new SupabaseUser(
                    id,
                    email.trim().toLowerCase(),
                    name,
                    role
            );

        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Could not verify the Supabase session.");
        } catch (IOException | IllegalArgumentException ex) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid Supabase access token.");
        }
    }

    private static String text(JsonNode node, String field) {
        JsonNode value = node.get(field);

        if (value == null || value.isNull() || value.asText().isBlank()) {
            return null;
        }

        return value.asText();
    }

    private static ResponseStatusException unauthorized() {
        return new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Invalid or expired Supabase session.");
    }

    public record SupabaseUser(
            String id,
            String email,
            String name,
            String role) {
    }
}