package com.finxguard.backend.controller;

import java.util.List;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.finxguard.backend.model.Transaction;
import com.finxguard.backend.repository.TransactionRepository;
import com.finxguard.backend.service.TransactionService;
import com.finxguard.backend.auth.AuthContext;
import com.finxguard.backend.auth.AuthenticatedUser;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"})
public class TransactionController {

    private final TransactionService transactionService;
    private final TransactionRepository transactionRepository;

    public TransactionController(TransactionService transactionService, TransactionRepository transactionRepository) {
        this.transactionService = transactionService;
        this.transactionRepository = transactionRepository;
    }

    @PostMapping
    public ResponseEntity<Transaction> createTransaction(
            @RequestBody Transaction transaction) {

        Transaction savedTransaction =
                transactionService.createTransaction(transaction);

        return ResponseEntity.ok(savedTransaction);
    }

    @GetMapping
    public ResponseEntity<List<Transaction>> getAllTransactions() {
        return ResponseEntity.ok(transactionRepository.findAllOrdered());
    }

    @GetMapping("/{transactionId}")
    public ResponseEntity<Transaction> getTransactionById(
            @PathVariable String transactionId,
            HttpServletRequest request) {
        AuthenticatedUser user = AuthContext.require(request.getAttribute(AuthContext.REQUEST_ATTRIBUTE));
        var transaction = "ADMIN".equals(user.role())
                ? transactionRepository.findByTransactionId(transactionId)
                : transactionRepository.findByTransactionIdAndUserId(transactionId, user.id());
        return transaction
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/my")
    public ResponseEntity<List<Transaction>> getMyTransactions(HttpServletRequest request) {
        AuthenticatedUser user = AuthContext.require(request.getAttribute(AuthContext.REQUEST_ATTRIBUTE));
        return ResponseEntity.ok(transactionRepository.findByUserIdOrdered(user.id()));
    }

    @GetMapping("/my/{transactionId}")
    public ResponseEntity<Transaction> getMyTransaction(
            @PathVariable String transactionId,
            HttpServletRequest request) {
        AuthenticatedUser user = AuthContext.require(request.getAttribute(AuthContext.REQUEST_ATTRIBUTE));
        return transactionRepository.findByTransactionIdAndUserId(transactionId, user.id())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<String>> getUserTransactionIds(@PathVariable String userId) throws Exception {
        return ResponseEntity.ok(transactionService.getUserTransactionIds(userId));
    }
}