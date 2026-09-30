package com.finxguard.backend.repository;

import org.springframework.data.repository.CrudRepository;

import com.finxguard.backend.model.Transaction;

public interface TransactionRepository extends CrudRepository<Transaction, Long> {

}