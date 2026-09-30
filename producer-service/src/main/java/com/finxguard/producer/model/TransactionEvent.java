package com.finxguard.producer.model;

import java.time.LocalDateTime;

public class TransactionEvent {

    private String transactionId;
    private String userId;
    private Double amount;
    private LocalDateTime transactionTime;

    public TransactionEvent() {
    }

    public TransactionEvent(
            String transactionId,
            String userId,
            Double amount,
            LocalDateTime transactionTime) {

        this.transactionId = transactionId;
        this.userId = userId;
        this.amount = amount;
        this.transactionTime = transactionTime;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public LocalDateTime getTransactionTime() {
        return transactionTime;
    }

    public void setTransactionTime(LocalDateTime transactionTime) {
        this.transactionTime = transactionTime;
    }
}