package com.finxguard.consumer_service.repository;

import java.util.List;

import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import com.finxguard.consumer_service.model.Transaction;

public interface TransactionRepository extends CrudRepository<Transaction, Long> {

    boolean existsByTransactionId(String transactionId);

    @Query("SELECT amount FROM transactions WHERE user_id = :userId AND decision = 'APPROVED' ORDER BY amount DESC LIMIT 3")
    List<Double> findTop3ApprovedAmountsByUserId(@Param("userId") String userId);

    @Query("SELECT COUNT(*) FROM transactions WHERE user_id = :userId AND decision = 'APPROVED'")
    Long countApprovedByUserId(@Param("userId") String userId);

    @Query("SELECT COALESCE(AVG(amount), 0.0) FROM transactions WHERE user_id = :userId AND decision = 'APPROVED'")
    Double findAverageAmountByUserId(@Param("userId") String userId);

    @Query("SELECT COUNT(*) FROM transactions WHERE user_id = :userId")
    Long countByUserId(@Param("userId") String userId);

    @Query("SELECT DISTINCT device_id FROM transactions WHERE user_id = :userId AND device_id IS NOT NULL")
    List<String> findDistinctDeviceIdsByUserId(@Param("userId") String userId);

    @Query("SELECT DISTINCT country FROM transactions WHERE user_id = :userId AND country IS NOT NULL")
    List<String> findDistinctCountriesByUserId(@Param("userId") String userId);
}