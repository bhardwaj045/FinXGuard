package com.finxguard.backend.auth;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public final class AuthContext {

    public static final String REQUEST_ATTRIBUTE = AuthContext.class.getName() + ".user";

    private AuthContext() {
    }

    public static AuthenticatedUser require(Object value) {
        if (value instanceof AuthenticatedUser user) {
            return user;
        }
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
    }
}
