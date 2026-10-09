package com.finxguard.backend.controller;

import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.finxguard.backend.model.Transaction;
import com.finxguard.backend.repository.TransactionRepository;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"})
public class AnalyticsController {

    private final TransactionRepository transactionRepository;
    private final JdbcTemplate jdbcTemplate;

    public AnalyticsController(TransactionRepository transactionRepository, JdbcTemplate jdbcTemplate) {
        this.transactionRepository = transactionRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummaryMetrics() {
        Map<String, Object> summary = jdbcTemplate.queryForMap(
                "SELECT COUNT(*) AS total_count, " +
                        "COALESCE(SUM(CASE WHEN decision = 'APPROVED' THEN 1 ELSE 0 END), 0) AS approved_count, " +
                        "COALESCE(SUM(CASE WHEN decision = 'REVIEW' THEN 1 ELSE 0 END), 0) AS review_count, " +
                        "COALESCE(SUM(CASE WHEN decision = 'BLOCKED' THEN 1 ELSE 0 END), 0) AS blocked_count, " +
                        "COALESCE(AVG(risk_score), 0.0) AS average_risk_score " +
                        "FROM transactions");
        return ResponseEntity.ok(new LinkedHashMap<>(summary));
    }

    @GetMapping("/by-status")
    public ResponseEntity<List<Map<String, Object>>> getAnalyticsByStatus() {
        return ResponseEntity.ok(transactionRepository.countTransactionsByStatus());
    }

    @GetMapping("/by-decision")
    public ResponseEntity<List<Map<String, Object>>> getAnalyticsByDecision() {
        return ResponseEntity.ok(transactionRepository.countTransactionsByDecision());
    }

    @GetMapping("/by-hour")
    public ResponseEntity<List<Map<String, Object>>> getAnalyticsByHour() {
        return ResponseEntity.ok(transactionRepository.countTransactionsByHourAndDecision());
    }

    @GetMapping("/suspicious")
    public ResponseEntity<List<Transaction>> getSuspiciousTransactions() {
        return ResponseEntity.ok(transactionRepository.findSuspicious());
    }
}
