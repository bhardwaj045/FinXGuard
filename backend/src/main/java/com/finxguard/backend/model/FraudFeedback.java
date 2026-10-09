package com.finxguard.backend.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Table("fraud_feedback")
public class FraudFeedback {

    @Id
    private Long id;

    @Column("transaction_id")
    private String transactionId;

    @Column("predicted_decision")
    private String predictedDecision;

    @Column("actual_fraud")
    private Boolean actualFraud;

    @Column("feedback_source")
    private String feedbackSource = "USER";

    @Column("feedback_time")
    private LocalDateTime feedbackTime = LocalDateTime.now();

    public FraudFeedback() {
    }

    public FraudFeedback(String transactionId, String predictedDecision, Boolean actualFraud, String feedbackSource) {
        this.transactionId = transactionId;
        this.predictedDecision = predictedDecision;
        this.actualFraud = actualFraud;
        this.feedbackSource = feedbackSource != null ? feedbackSource : "USER";
        this.feedbackTime = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public String getPredictedDecision() {
        return predictedDecision;
    }

    public void setPredictedDecision(String predictedDecision) {
        this.predictedDecision = predictedDecision;
    }

    public Boolean getActualFraud() {
        return actualFraud;
    }

    public void setActualFraud(Boolean actualFraud) {
        this.actualFraud = actualFraud;
    }

    public String getFeedbackSource() {
        return feedbackSource;
    }

    public void setFeedbackSource(String feedbackSource) {
        this.feedbackSource = feedbackSource;
    }

    public LocalDateTime getFeedbackTime() {
        return feedbackTime;
    }

    public void setFeedbackTime(LocalDateTime feedbackTime) {
        this.feedbackTime = feedbackTime;
    }
}
