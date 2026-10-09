package com.finxguard.backend.repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import com.finxguard.backend.model.Transaction;

public interface TransactionRepository extends CrudRepository<Transaction, Long> {

    Optional<Transaction> findByTransactionId(String transactionId);

    @Query("SELECT * FROM transactions WHERE user_id = :userId ORDER BY transaction_time DESC")
    List<Transaction> findByUserIdOrdered(@Param("userId") String userId);

    @Query("SELECT * FROM transactions WHERE transaction_id = :transactionId AND user_id = :userId")
    Optional<Transaction> findByTransactionIdAndUserId(
            @Param("transactionId") String transactionId,
            @Param("userId") String userId);

    @Query("SELECT * FROM transactions ORDER BY transaction_time DESC LIMIT 100")
    List<Transaction> findAllOrdered();

    @Query("SELECT * FROM transactions WHERE decision IN ('BLOCKED', 'REVIEW') OR risk_score >= 50 ORDER BY transaction_time DESC LIMIT 100")
    List<Transaction> findSuspicious();

    @Query("SELECT status, COUNT(*) AS count FROM transactions GROUP BY status")
    List<Map<String, Object>> countTransactionsByStatus();

    @Query("SELECT decision, COUNT(*) AS count FROM transactions GROUP BY decision")
    List<Map<String, Object>> countTransactionsByDecision();

    @Query("SELECT DATE_TRUNC('hour', transaction_time) AS hour, decision, COUNT(*) AS count FROM transactions GROUP BY hour, decision ORDER BY hour DESC")
    List<Map<String, Object>> countTransactionsByHourAndDecision();

}