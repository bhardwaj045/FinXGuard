package com.finxguard.backend.auth;

import java.time.LocalDateTime;

public record AuthenticatedUser(
        String id,
        String name,
        String email,
        String role,
        LocalDateTime createdAt) {
}
