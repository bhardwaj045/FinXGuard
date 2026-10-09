package com.finxguard.backend.controller;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.finxguard.backend.auth.AuthContext;
import com.finxguard.backend.auth.AuthenticatedUser;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"})
public class UserController {

    @GetMapping("/me")
    public AuthenticatedUser me(HttpServletRequest request) {
        return AuthContext.require(request.getAttribute(AuthContext.REQUEST_ATTRIBUTE));
    }
}
