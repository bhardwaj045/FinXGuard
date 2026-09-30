package com.finxguard.backend.service;

import org.springframework.stereotype.Service;

import com.finxguard.backend.model.Transaction;
import com.finxguard.backend.repository.TransactionRepository;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;

    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public Transaction createTransaction(Transaction transaction) {
        return transactionRepository.save(transaction);
    }
}