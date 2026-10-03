package com.finxguard.consumer_service.repository;

import org.springframework.data.repository.CrudRepository;

import com.finxguard.consumer_service.model.Transaction;

public interface TransactionRepository
        extends CrudRepository<Transaction, Long> {
}