package com.finxguard.backend.controller;

import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.finxguard.backend.model.FraudFeedback;
import com.finxguard.backend.model.Transaction;
import com.finxguard.backend.repository.FraudFeedbackRepository;
import com.finxguard.backend.repository.TransactionRepository;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"})
public class FeedbackController {

    private final FraudFeedbackRepository feedbackRepository;
    private final TransactionRepository transactionRepository;

    public FeedbackController(FraudFeedbackRepository feedbackRepository, TransactionRepository transactionRepository) {
        this.feedbackRepository = feedbackRepository;
        this.transactionRepository = transactionRepository;
    }

    @PostMapping
    public ResponseEntity<?> submitFeedback(@RequestBody FraudFeedback request) {
        if (request.getTransactionId() == null || request.getActualFraud() == null) {
            return ResponseEntity.badRequest().body("transactionId and actualFraud are required");
        }

        Optional<Transaction> txOpt = transactionRepository.findByTransactionId(request.getTransactionId());
        String predictedDecision = txOpt.isPresent()
                ? txOpt.get().getDecision()
                : "UNKNOWN";

        // Check if feedback exists
        Optional<FraudFeedback> existingOpt = feedbackRepository.findByTransactionId(request.getTransactionId());
        FraudFeedback feedback;
        if (existingOpt.isPresent()) {
            feedback = existingOpt.get();
            feedback.setActualFraud(request.getActualFraud());
            feedback.setFeedbackSource(request.getFeedbackSource() != null ? request.getFeedbackSource() : "ANALYST");
        } else {
            feedback = new FraudFeedback(
                request.getTransactionId(),
                predictedDecision,
                request.getActualFraud(),
                request.getFeedbackSource() != null ? request.getFeedbackSource() : "ANALYST"
            );
        }

        FraudFeedback saved = feedbackRepository.save(feedback);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<Iterable<FraudFeedback>> getAllFeedback() {
        return ResponseEntity.ok(feedbackRepository.findAll());
    }

    @GetMapping("/{transactionId}")
    public ResponseEntity<?> getFeedbackByTransaction(@PathVariable String transactionId) {
        Optional<FraudFeedback> fb = feedbackRepository.findByTransactionId(transactionId);
        return fb.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
