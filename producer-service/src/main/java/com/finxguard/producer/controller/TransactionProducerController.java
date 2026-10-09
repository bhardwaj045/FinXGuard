package com.finxguard.producer.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.finxguard.producer.model.TransactionEvent;
import com.finxguard.producer.service.AuthenticatedIdentityClient;
import com.finxguard.producer.service.CsvStreamProducerService;
import com.finxguard.producer.service.KafkaProducerService;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/producer")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"}, allowedHeaders = {"Authorization", "Content-Type"})
public class TransactionProducerController {

    private final KafkaProducerService kafkaProducerService;
    private final CsvStreamProducerService csvStreamProducerService;
    private final AuthenticatedIdentityClient identityClient;

    public TransactionProducerController(
            KafkaProducerService kafkaProducerService,
            CsvStreamProducerService csvStreamProducerService,
            AuthenticatedIdentityClient identityClient) {

        this.kafkaProducerService = kafkaProducerService;
        this.csvStreamProducerService = csvStreamProducerService;
        this.identityClient = identityClient;
    }

    @PostMapping("/transactions")
    public ResponseEntity<Map<String, String>> sendTransaction(
            @RequestBody TransactionEvent transaction,
            @org.springframework.web.bind.annotation.RequestHeader(value = "Authorization", required = false) String authorization) {

        AuthenticatedIdentityClient.UserIdentity user = identityClient.requireUser(authorization, "USER");
        if (transaction.getAmount() == null || transaction.getAmount() <= 0
                || transaction.getMerchantId() == null || transaction.getMerchantId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A positive amount and merchant are required");
        }
        transaction.setTransactionId(UUID.randomUUID().toString());
        transaction.setUserId(user.id());
        if (transaction.getTransactionTime() == null) {
            transaction.setTransactionTime(LocalDateTime.now());
        }

        kafkaProducerService.sendTransaction(transaction);

        return ResponseEntity.accepted().body(Map.of("transactionId", transaction.getTransactionId()));
    }

    @PostMapping("/stream-csv")
    public ResponseEntity<String> streamCsv(
            @RequestParam(defaultValue = "data/creditcard.csv") String path,
            @RequestParam(defaultValue = "50") int delayMs,
            @RequestParam(defaultValue = "100") int maxRecords,
            @org.springframework.web.bind.annotation.RequestHeader(value = "Authorization", required = false) String authorization) {
        identityClient.requireUser(authorization, "ADMIN");
        try {
            int sent = csvStreamProducerService.streamCsv(path, delayMs, maxRecords);
            return ResponseEntity.ok("Streamed " + sent + " events from CSV to Kafka");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error streaming CSV: " + e.getMessage());
        }
    }
}