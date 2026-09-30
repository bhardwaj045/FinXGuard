package com.finxguard.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.finxguard.backend.model.Transaction;
import com.finxguard.backend.service.TransactionService;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping
    public ResponseEntity<Transaction> createTransaction(
            @RequestBody Transaction transaction) {

        Transaction savedTransaction =
                transactionService.createTransaction(transaction);

        return ResponseEntity.ok(savedTransaction);
    }
}