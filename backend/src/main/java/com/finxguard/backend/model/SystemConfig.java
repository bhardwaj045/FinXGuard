package com.finxguard.backend.model;

public class SystemConfig {
    private double mlFraudThreshold = 0.90;
    private double amountAnomalyMultiplier = 15.0;
    private int minUserHistory = 3;
    private int velocityThreshold = 5;
    private int velocityWindow = 60;

    public SystemConfig() {}

    public SystemConfig(double mlFraudThreshold, double amountAnomalyMultiplier, int minUserHistory, int velocityThreshold, int velocityWindow) {
        this.mlFraudThreshold = mlFraudThreshold;
        this.amountAnomalyMultiplier = amountAnomalyMultiplier;
        this.minUserHistory = minUserHistory;
        this.velocityThreshold = velocityThreshold;
        this.velocityWindow = velocityWindow;
    }

    public double getMlFraudThreshold() { return mlFraudThreshold; }
    public void setMlFraudThreshold(double mlFraudThreshold) { this.mlFraudThreshold = mlFraudThreshold; }

    public double getAmountAnomalyMultiplier() { return amountAnomalyMultiplier; }
    public void setAmountAnomalyMultiplier(double amountAnomalyMultiplier) { this.amountAnomalyMultiplier = amountAnomalyMultiplier; }

    public int getMinUserHistory() { return minUserHistory; }
    public void setMinUserHistory(int minUserHistory) { this.minUserHistory = minUserHistory; }

    public int getVelocityThreshold() { return velocityThreshold; }
    public void setVelocityThreshold(int velocityThreshold) { this.velocityThreshold = velocityThreshold; }

    public int getVelocityWindow() { return velocityWindow; }
    public void setVelocityWindow(int velocityWindow) { this.velocityWindow = velocityWindow; }
}
