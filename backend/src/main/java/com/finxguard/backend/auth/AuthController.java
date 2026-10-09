package com.finxguard.backend.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
})
public class AuthController {

    private final AuthService authService;
    private final SupabaseTokenVerifier tokenVerifier;

    public AuthController(
            AuthService authService,
            SupabaseTokenVerifier tokenVerifier) {
        this.authService = authService;
        this.tokenVerifier = tokenVerifier;
    }

    /*
     * Call this after Supabase signup has produced a valid session,
     * or after the user confirms their email and signs in.
     */
    @PostMapping("/profile/sync")
    public ResponseEntity<AuthenticatedUser> synchronizeProfile(
            @RequestHeader(
                    value = "Authorization",
                    required = false) String authorization,
            @Valid @RequestBody(required = false) ProfileSyncRequest body) {

        String accessToken = extractBearerToken(authorization);

        SupabaseTokenVerifier.SupabaseUser supabaseUser =
                tokenVerifier.verify(accessToken);

        String requestedName = body == null ? null : body.name();
        String requestedRole = body == null ? null : body.role();
        String accessKey = body == null ? null : body.accessKey();

        AuthenticatedUser profile =
                authService.synchronizeSupabaseProfile(
                        supabaseUser,
                        requestedName,
                        requestedRole,
                        accessKey);

        return ResponseEntity.ok(profile);
    }

    /*
     * The authentication filter must validate the bearer token
     * and populate AuthContext before this endpoint is called.
     */
    @GetMapping("/me")
    public AuthenticatedUser me(HttpServletRequest request) {
        return AuthContext.require(
                request.getAttribute(AuthContext.REQUEST_ATTRIBUTE));
    }

    /*
     * Supabase sessions are revoked client-side using supabase.auth.signOut().
     * This endpoint does not revoke a legacy Spring session.
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent().build();
    }

    private static String extractBearerToken(String authorization) {
        if (authorization == null
                || !authorization.regionMatches(true, 0, "Bearer ", 0, 7)) {
            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Missing Supabase bearer token.");
        }

        String token = authorization.substring(7).trim();

        if (token.isBlank()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Missing Supabase bearer token.");
        }

        return token;
    }

    public record ProfileSyncRequest(
            @Size(max = 160) String name,
            String role,
            String accessKey) {
    }
}