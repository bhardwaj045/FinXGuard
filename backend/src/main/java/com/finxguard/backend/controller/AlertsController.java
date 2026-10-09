package com.finxguard.backend.controller;

import java.util.List;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.finxguard.backend.auth.AuthContext;
import com.finxguard.backend.auth.AuthenticatedUser;
import com.finxguard.backend.model.Transaction;
import com.finxguard.backend.repository.TransactionRepository;

@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"})
public class AlertsController {

    private final TransactionRepository transactionRepository;

    public AlertsController(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    @GetMapping("/my")
    public ResponseEntity<List<Transaction>> myAlerts(HttpServletRequest request) {
        AuthenticatedUser user = AuthContext.require(request.getAttribute(AuthContext.REQUEST_ATTRIBUTE));
        List<Transaction> alerts = transactionRepository.findByUserIdOrdered(user.id()).stream()
                .filter(tx -> "REVIEW".equalsIgnoreCase(tx.getDecision())
                        || "BLOCKED".equalsIgnoreCase(tx.getDecision()))
                .toList();
        return ResponseEntity.ok(alerts);
    }
}
