package com.finxguard.backend.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@SpringBootTest
@TestPropertySource(properties = "finxguard.admin-registration-key=test-admin-secret-key")
class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @BeforeEach
    void clearAccounts() {
        jdbcTemplate.update("DELETE FROM app_users");
    }

    @Test
    @Transactional
    void synchronizeSupabaseProfileCreatesNewUserAndIsIdempotent() {
        SupabaseTokenVerifier.SupabaseUser sbUser =
                new SupabaseTokenVerifier.SupabaseUser(
                        "sb-12345",
                        "test@example.com",
                        "Test Supabase User",
                        "USER");

        AuthenticatedUser profile =
                authService.synchronizeSupabaseProfile(sbUser, "Test Supabase User");

        assertNotNull(profile);
        assertEquals("test@example.com", profile.email());
        assertEquals("Test Supabase User", profile.name());
        assertEquals("USER", profile.role());

        // Verify record in PostgreSQL database
        String dbUserId = jdbcTemplate.queryForObject(
                "SELECT id FROM app_users WHERE supabase_user_id = ?",
                String.class,
                "sb-12345");
        assertEquals(profile.id(), dbUserId);

        assertTrue(authService.accountExists("test@example.com"));

        // Repeated sync with the same Supabase ID returns the same profile idempotently
        AuthenticatedUser secondSync =
                authService.synchronizeSupabaseProfile(sbUser, "Updated Name Attempt");

        assertEquals(profile.id(), secondSync.id());
        assertEquals("test@example.com", secondSync.email());
    }

    @Test
    @Transactional
    void synchronizeSupabaseProfileLinksPreExistingUserByEmail() {
        // Pre-insert an existing user with null supabase_user_id (e.g. created prior to migration)
        String legacyId = "legacy-user-id";
        jdbcTemplate.update(
                """
                INSERT INTO app_users (id, name, email, password_hash, role, created_at, supabase_user_id)
                VALUES (?, 'Legacy User', 'legacy@example.com', 'dummy_hash', 'USER', CURRENT_TIMESTAMP, NULL)
                """,
                legacyId);

        SupabaseTokenVerifier.SupabaseUser sbUser =
                new SupabaseTokenVerifier.SupabaseUser(
                        "sb-legacy-link",
                        "legacy@example.com",
                        "Legacy User",
                        "USER");

        AuthenticatedUser synced =
                authService.synchronizeSupabaseProfile(sbUser, "Legacy User");

        assertEquals(legacyId, synced.id());
        assertEquals("legacy@example.com", synced.email());

        // Verify supabase_user_id was linked in database
        String linkedSupabaseId = jdbcTemplate.queryForObject(
                "SELECT supabase_user_id FROM app_users WHERE id = ?",
                String.class,
                legacyId);
        assertEquals("sb-legacy-link", linkedSupabaseId);
    }

    @Test
    @Transactional
    void synchronizeAdminRegistrationWithAccessKeyEnforcesSecurity() {
        SupabaseTokenVerifier.SupabaseUser sbAdmin =
                new SupabaseTokenVerifier.SupabaseUser(
                        "sb-admin-1",
                        "admin@finxguard.com",
                        "Initial Admin",
                        "ADMIN");

        // Invalid access key must be rejected with 403 Forbidden
        assertThrows(ResponseStatusException.class, () ->
                authService.synchronizeSupabaseProfile(
                        sbAdmin,
                        "Initial Admin",
                        "ADMIN",
                        "wrong-key"));

        // Valid access key succeeds for initial admin
        AuthenticatedUser adminProfile =
                authService.synchronizeSupabaseProfile(
                        sbAdmin,
                        "Initial Admin",
                        "ADMIN",
                        "test-admin-secret-key");

        assertEquals("ADMIN", adminProfile.role());

        // Attempting to register a second administrator must be rejected with 409 Conflict
        SupabaseTokenVerifier.SupabaseUser sbAdmin2 =
                new SupabaseTokenVerifier.SupabaseUser(
                        "sb-admin-2",
                        "admin2@finxguard.com",
                        "Second Admin",
                        "ADMIN");

        assertThrows(ResponseStatusException.class, () ->
                authService.synchronizeSupabaseProfile(
                        sbAdmin2,
                        "Second Admin",
                        "ADMIN",
                        "test-admin-secret-key"));
    }
}
