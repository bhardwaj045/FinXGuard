package com.finxguard.consumer_service.service;

import java.time.LocalDateTime;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import com.finxguard.consumer_service.client.RuleEngineClient;
import com.finxguard.consumer_service.model.Transaction;
import com.finxguard.consumer_service.model.TransactionEvent;
import com.finxguard.consumer_service.repository.TransactionRepository;

import tools.jackson.databind.ObjectMapper;

@Service
public class KafkaConsumerService {

    private final TransactionRepository transactionRepository;
    private final ObjectMapper objectMapper;
    private final RuleEngineClient ruleEngineClient;

    public KafkaConsumerService(
            TransactionRepository transactionRepository,
            ObjectMapper objectMapper,
            RuleEngineClient ruleEngineClient) {

        this.transactionRepository = transactionRepository;
        this.objectMapper = objectMapper;
        this.ruleEngineClient = ruleEngineClient;
    }

    @KafkaListener(
            topics = "transactions.raw",
            groupId = "finxguard-consumer-group"
    )
    public void consumeTransaction(String message) {

        try {

            // Convert Kafka JSON into Java object
            TransactionEvent event =
                    objectMapper.readValue(message, TransactionEvent.class);

            // Call Rules Engine
            boolean ruleFlag =
                    ruleEngineClient.checkVelocity(event.getUserId());

            // Create database transaction object
            Transaction transaction = new Transaction();

            transaction.setTransactionId(event.getTransactionId());
            transaction.setUserId(event.getUserId());
            transaction.setAmount(event.getAmount());
            transaction.setTransactionTime(event.getTransactionTime());

            // Save rule result
            transaction.setRuleFlag(ruleFlag);

            // ML will be added later
            transaction.setFraudProbability(0.0);

            // Decide status
            if (ruleFlag) {
                transaction.setStatus("FLAGGED");
            } else {
                transaction.setStatus("PENDING");
            }

            transaction.setCreatedAt(LocalDateTime.now());

            // Save to PostgreSQL
            transactionRepository.save(transaction);

            // Print result
            System.out.println("=================================");
            System.out.println("Transaction processed");
            System.out.println("Transaction ID: " + transaction.getTransactionId());
            System.out.println("User ID: " + transaction.getUserId());
            System.out.println("Rule Flag: " + ruleFlag);
            System.out.println("Status: " + transaction.getStatus());
            System.out.println("=================================");

        } catch (Exception e) {

            System.out.println("Error processing transaction:");
            e.printStackTrace();

        }
    }
}