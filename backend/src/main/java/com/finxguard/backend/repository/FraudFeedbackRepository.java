package com.finxguard.backend.repository;

import java.util.Optional;

import org.springframework.data.repository.CrudRepository;

import com.finxguard.backend.model.FraudFeedback;

public interface FraudFeedbackRepository extends CrudRepository<FraudFeedback, Long> {
    Optional<FraudFeedback> findByTransactionId(String transactionId);
}
