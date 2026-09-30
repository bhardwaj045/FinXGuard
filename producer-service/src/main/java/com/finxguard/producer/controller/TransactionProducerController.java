package com.finxguard.producer.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.finxguard.producer.model.TransactionEvent;
import com.finxguard.producer.service.KafkaProducerService;

@RestController
@RequestMapping("/api/producer")
public class TransactionProducerController {

    private final KafkaProducerService kafkaProducerService;

    public TransactionProducerController(
            KafkaProducerService kafkaProducerService) {

        this.kafkaProducerService = kafkaProducerService;
    }

    @PostMapping("/transactions")
    public ResponseEntity<String> sendTransaction(
            @RequestBody TransactionEvent transaction) {

        kafkaProducerService.sendTransaction(transaction);

        return ResponseEntity.ok(
                "Transaction sent successfully to Kafka"
        );
    }
}