package com.finxguard.producer.service;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.finxguard.producer.model.TransactionEvent;

@Service
public class KafkaProducerService {

    private static final String TOPIC = "transactions.raw";

    private final KafkaTemplate<String, TransactionEvent> kafkaTemplate;

    public KafkaProducerService(
            KafkaTemplate<String, TransactionEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendTransaction(TransactionEvent transaction) {

        kafkaTemplate.send(
                TOPIC,
                transaction.getTransactionId(),
                transaction
        );
    }
}