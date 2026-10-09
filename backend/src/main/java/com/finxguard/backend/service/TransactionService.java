package com.finxguard.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.finxguard.backend.dao.TransactionJdbcDao;
import com.finxguard.backend.exception.InvalidTransactionException;
import com.finxguard.backend.model.Transaction;
import com.finxguard.backend.repository.TransactionRepository;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final TransactionJdbcDao transactionJdbcDao;

    public TransactionService(TransactionRepository transactionRepository, TransactionJdbcDao transactionJdbcDao) {
        this.transactionRepository = transactionRepository;
        this.transactionJdbcDao = transactionJdbcDao;
    }

    public Transaction createTransaction(Transaction transaction) {
        if (transaction == null || transaction.getAmount() == null || transaction.getAmount() <= 0) {
            throw new InvalidTransactionException("Transaction amount must be greater than 0");
        }
        return transactionRepository.save(transaction);
    }

    public List<String> getUserTransactionIds(String userId) throws Exception {
        return transactionJdbcDao.findTransactionIdsByUser(userId);
    }
}