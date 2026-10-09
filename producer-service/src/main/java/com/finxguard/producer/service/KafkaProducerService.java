package com.finxguard.producer.service;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.concurrent.TimeUnit;

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
        try {
            kafkaTemplate.send(TOPIC, transaction.getUserId(), transaction)
                    .get(5, TimeUnit.SECONDS);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Kafka send was interrupted", ex);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Transaction could not be accepted by Kafka", ex);
        }
    }
}