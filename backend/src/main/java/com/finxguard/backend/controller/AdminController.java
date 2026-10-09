package com.finxguard.backend.controller;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.time.LocalDateTime;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.finxguard.backend.model.Transaction;
import com.finxguard.backend.repository.TransactionRepository;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"})
public class AdminController {

    private final TransactionRepository transactionRepository;
    private final JdbcTemplate jdbcTemplate;

    public AdminController(TransactionRepository transactionRepository, JdbcTemplate jdbcTemplate) {
        this.transactionRepository = transactionRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard() {
        Map<String, Object> raw = jdbcTemplate.queryForMap(
                "SELECT COUNT(*) AS total_count, " +
                        "SUM(CASE WHEN decision = 'APPROVED' THEN 1 ELSE 0 END) AS approved_count, " +
                        "SUM(CASE WHEN decision = 'REVIEW' THEN 1 ELSE 0 END) AS review_count, " +
                        "SUM(CASE WHEN decision = 'BLOCKED' THEN 1 ELSE 0 END) AS blocked_count, " +
                        "SUM(CASE WHEN risk_score >= 0 AND risk_score < 30 THEN 1 ELSE 0 END) AS low_risk_count, " +
                        "SUM(CASE WHEN risk_score >= 30 AND risk_score < 70 THEN 1 ELSE 0 END) AS elevated_risk_count, " +
                        "SUM(CASE WHEN risk_score >= 70 THEN 1 ELSE 0 END) AS high_risk_count, " +
                        "COALESCE(AVG(risk_score), 0.0) AS avg_risk_score " +
                        "FROM transactions");
        List<Map<String, Object>> activityTrend = jdbcTemplate.queryForList(
                "SELECT CAST(transaction_time AS DATE) AS day, COUNT(*) AS total_count, " +
                        "SUM(CASE WHEN decision = 'REVIEW' THEN 1 ELSE 0 END) AS review_count, " +
                        "SUM(CASE WHEN decision = 'BLOCKED' THEN 1 ELSE 0 END) AS blocked_count " +
                        "FROM transactions WHERE transaction_time >= ? " +
                        "GROUP BY CAST(transaction_time AS DATE) ORDER BY day",
                LocalDateTime.now().minusDays(6));
        long total = number(raw.get("total_count"));
        long approved = number(raw.get("approved_count"));
        long review = number(raw.get("review_count"));
        long blocked = number(raw.get("blocked_count"));
        double averageRisk = decimal(raw.get("avg_risk_score"));
        long completed = approved + review + blocked;

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total_count", total);
        result.put("approved_count", approved);
        result.put("review_count", review);
        result.put("blocked_count", blocked);
        result.put("average_risk_score", averageRisk);
        result.put("fraud_rate", completed == 0 ? null : (blocked * 100.0) / completed);
        result.put("risk_distribution", Map.of(
                "low", number(raw.get("low_risk_count")),
                "elevated", number(raw.get("elevated_risk_count")),
                "high", number(raw.get("high_risk_count"))));
        result.put("activity_trend", activityTrend);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/detection")
    public ResponseEntity<List<Transaction>> detectionCases() {
        return ResponseEntity.ok(transactionRepository.findSuspicious());
    }

    @GetMapping("/algorithm")
    public ResponseEntity<Map<String, Object>> algorithm() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("algorithm", "Logistic Regression");
        result.put("library", "Smile");
        result.put("modelVersion", "app_v1");
        result.put("threshold", 0.90);
        result.put("applicationThreshold", 0.50);
        result.put("applicationFeatures", List.of(
                "Current Amount", "Amount Deviation Ratio", "Velocity Count", "New Device",
                "New Country", "High-Risk Merchant", "Channel", "Prior Approved Count",
                "User Baseline Amount", "High Amount"));
        result.put("kaggleFeatures", "V1–V28 + Amount");
        result.put("precision", null);
        result.put("recall", null);
        result.put("f1", null);
        result.put("aucPr", null);
        return ResponseEntity.ok(result);
    }

    private static long number(Object value) {
        return value instanceof Number number ? number.longValue() : 0L;
    }

    private static double decimal(Object value) {
        return value instanceof Number number ? number.doubleValue() : 0.0;
    }
}
