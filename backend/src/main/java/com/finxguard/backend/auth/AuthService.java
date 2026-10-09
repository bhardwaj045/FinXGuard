package com.finxguard.backend.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final JdbcTemplate jdbcTemplate;
    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();
    private final String adminRegistrationKey;

    public AuthService(
            JdbcTemplate jdbcTemplate,
            @Value("${finxguard.admin-registration-key:}")
            String adminRegistrationKey) {

        this.jdbcTemplate = jdbcTemplate;
        this.adminRegistrationKey = adminRegistrationKey;

        initializeTables();
    }

    // ---------------------------------------------------------
    // ACCOUNT & USER LOOKUP
    // ---------------------------------------------------------

    public boolean accountExists(String email) {
        String normalizedEmail = normalizeEmail(email);

        Integer count = jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*)
                FROM app_users
                WHERE LOWER(email) = LOWER(?)
                """,
                Integer.class,
                normalizedEmail);

        return count != null && count > 0;
    }

    public Optional<AuthenticatedUser> findUserBySupabaseId(String supabaseUserId) {
        if (supabaseUserId == null || supabaseUserId.isBlank()) {
            return Optional.empty();
        }

        return jdbcTemplate.query(
                """
                SELECT id, name, email, role, created_at
                FROM app_users
                WHERE supabase_user_id = ?
                LIMIT 1
                """,
                (rs, rowNum) -> mapUser(rs),
                supabaseUserId.trim())
                .stream()
                .findFirst();
    }

    public Optional<AuthenticatedUser> findUserByEmail(String email) {
        if (email == null || email.isBlank()) {
            return Optional.empty();
        }

        return jdbcTemplate.query(
                """
                SELECT id, name, email, role, created_at
                FROM app_users
                WHERE LOWER(email) = LOWER(?)
                LIMIT 1
                """,
                (rs, rowNum) -> mapUser(rs),
                normalizeEmail(email))
                .stream()
                .findFirst();
    }

    // ---------------------------------------------------------
    // SUPABASE PROFILE SYNCHRONIZATION
    // ---------------------------------------------------------

    @Transactional
    public AuthenticatedUser synchronizeSupabaseProfile(
            SupabaseTokenVerifier.SupabaseUser supabaseUser,
            String requestedName) {
        return synchronizeSupabaseProfile(supabaseUser, requestedName, null, null);
    }

    @Transactional
    public AuthenticatedUser synchronizeSupabaseProfile(
            SupabaseTokenVerifier.SupabaseUser supabaseUser,
            String requestedName,
            String requestedRole,
            String accessKey) {

        if (supabaseUser == null
                || supabaseUser.id() == null
                || supabaseUser.id().isBlank()
                || supabaseUser.email() == null
                || supabaseUser.email().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid Supabase user");
        }

        String supabaseId = supabaseUser.id().trim();
        String email = normalizeEmail(supabaseUser.email());

        String name = requestedName;

        if (name == null || name.isBlank()) {
            name = supabaseUser.name();
        }

        if (name == null || name.isBlank()) {
            name = email.substring(0, email.indexOf('@'));
        }

        name = normalizeName(name);

        List<AuthenticatedUser> linked = jdbcTemplate.query(
                """
                SELECT id, name, email, role, created_at
                FROM app_users
                WHERE supabase_user_id = ?
                LIMIT 1
                """,
                (rs, rowNum) -> mapUser(rs),
                supabaseId);

        if (!linked.isEmpty()) {
            AuthenticatedUser existing = linked.get(0);

            if (!existing.email().equalsIgnoreCase(email)) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Supabase email does not match the linked profile");
            }

            return existing;
        }

        List<AuthenticatedUser> existingByEmail = jdbcTemplate.query(
                """
                SELECT id, name, email, role, created_at
                FROM app_users
                WHERE LOWER(email) = LOWER(?)
                LIMIT 1
                """,
                (rs, rowNum) -> mapUser(rs),
                email);

        if (!existingByEmail.isEmpty()) {
            AuthenticatedUser existing = existingByEmail.get(0);

            try {
                jdbcTemplate.update(
                        """
                        UPDATE app_users
                        SET supabase_user_id = ?
                        WHERE id = ?
                          AND supabase_user_id IS NULL
                        """,
                        supabaseId,
                        existing.id());
            } catch (DuplicateKeyException ex) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Supabase account is already linked");
            }

            return existing;
        }

        String targetRole = "USER";
        String candidateRole = requestedRole != null && !requestedRole.isBlank()
                ? requestedRole
                : supabaseUser.role();

        if ("ADMIN".equalsIgnoreCase(candidateRole)) {
            if (adminRegistrationKey == null || adminRegistrationKey.isBlank()) {
                throw new ResponseStatusException(
                        HttpStatus.SERVICE_UNAVAILABLE,
                        "Administrator registration is not configured");
            }

            if (!constantTimeEquals(adminRegistrationKey, accessKey)) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Administrator registration key is invalid");
            }

            jdbcTemplate.queryForObject(
                    """
                    SELECT id
                    FROM admin_registration_guard
                    WHERE id = 1
                    FOR UPDATE
                    """,
                    Integer.class);

            Integer admins = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM app_users WHERE role = 'ADMIN'",
                    Integer.class);

            if (admins != null && admins > 0) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "The initial administrator already exists");
            }

            targetRole = "ADMIN";
        }

        String userId = UUID.randomUUID().toString();
        LocalDateTime createdAt = LocalDateTime.now();

        // Supabase handles passwords; this random unguessable hash satisfies legacy schema NOT NULL constraints safely.
        String unusablePasswordHash =
                passwordEncoder.encode(UUID.randomUUID().toString());

        try {
            jdbcTemplate.update(
                    """
                    INSERT INTO app_users
                        (id, name, email, password_hash, role,
                         created_at, supabase_user_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    userId,
                    name,
                    email,
                    unusablePasswordHash,
                    targetRole,
                    createdAt,
                    supabaseId);
        } catch (DuplicateKeyException ex) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Profile already exists or Supabase account is linked");
        }

        return new AuthenticatedUser(
                userId, name, email, targetRole, createdAt);
    }

    // ---------------------------------------------------------
    // DATABASE INITIALIZATION
    // ---------------------------------------------------------

 
private void initializeTables() {
    jdbcTemplate.execute(
            """
            CREATE TABLE IF NOT EXISTS app_users (
                id VARCHAR(36) PRIMARY KEY,
                name VARCHAR(160) NOT NULL,
                email VARCHAR(320) NOT NULL UNIQUE,
                password_hash VARCHAR(100),
                role VARCHAR(16) NOT NULL,
                created_at TIMESTAMP NOT NULL,
                supabase_user_id VARCHAR(128)
            )
            """);

    try {
        jdbcTemplate.execute(
                "ALTER TABLE app_users ALTER COLUMN password_hash DROP NOT NULL");
    } catch (Exception ignored) {
        // Safe if already nullable or unsupported by target dialect
    }

    jdbcTemplate.execute(
            """
            CREATE TABLE IF NOT EXISTS admin_registration_guard (
                id INTEGER PRIMARY KEY
            )
            """);

    try {
        jdbcTemplate.update(
                "INSERT INTO admin_registration_guard (id) VALUES (1)");
    } catch (DuplicateKeyException ignored) {
        // Guard already exists.
    }

    jdbcTemplate.execute(
            """
            ALTER TABLE app_users
            ADD COLUMN IF NOT EXISTS supabase_user_id VARCHAR(128)
            """);

    // Standard index without PostgreSQL-specific partial WHERE clauses for H2/PostgreSQL cross-compatibility
    jdbcTemplate.execute(
            """
            CREATE UNIQUE INDEX IF NOT EXISTS ux_app_users_supabase_user_id
            ON app_users (supabase_user_id)
            """);
}


    // ---------------------------------------------------------
    // HELPERS
    // ---------------------------------------------------------

    private static AuthenticatedUser mapUser(
            java.sql.ResultSet rs) throws java.sql.SQLException {

        return new AuthenticatedUser(
                rs.getString("id"),
                rs.getString("name"),
                rs.getString("email"),
                rs.getString("role"),
                rs.getTimestamp("created_at").toLocalDateTime());
    }

    private static String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email is required");
        }

        return email.trim().toLowerCase(Locale.ROOT);
    }

    private static String normalizeName(String name) {
        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Name is required");
        }

        String normalized = name.trim();

        if (normalized.length() > 160) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Name must not exceed 160 characters");
        }

        return normalized;
    }

    private static boolean constantTimeEquals(
            String expected,
            String supplied) {

        if (expected == null || supplied == null) {
            return false;
        }

        return MessageDigest.isEqual(
                expected.getBytes(StandardCharsets.UTF_8),
                supplied.getBytes(StandardCharsets.UTF_8));
    }
}
