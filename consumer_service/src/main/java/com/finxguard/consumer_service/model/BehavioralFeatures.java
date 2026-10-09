package com.finxguard.consumer_service.model;

import java.util.Collections;
import java.util.List;

public class BehavioralFeatures {

    private final double userAverageAmount;
    private final double currentAmount;
    private final double amountDeviationRatio;
    private final long priorTxCount;
    private final boolean newDevice;
    private final boolean newCountry;
    private final boolean highAmount;
    private final boolean highRiskMerchant;
    private final List<String> anomalyReasons;

    public BehavioralFeatures(
            double userAverageAmount,
            double currentAmount,
            double amountDeviationRatio,
            long priorTxCount,
            boolean newDevice,
            boolean newCountry,
            boolean highAmount,
            boolean highRiskMerchant,
            List<String> anomalyReasons) {
        this.userAverageAmount = userAverageAmount;
        this.currentAmount = currentAmount;
        this.amountDeviationRatio = amountDeviationRatio;
        this.priorTxCount = priorTxCount;
        this.newDevice = newDevice;
        this.newCountry = newCountry;
        this.highAmount = highAmount;
        this.highRiskMerchant = highRiskMerchant;
        this.anomalyReasons = anomalyReasons != null ? anomalyReasons : Collections.emptyList();
    }

    public double getUserAverageAmount() {
        return userAverageAmount;
    }

    public double getCurrentAmount() {
        return currentAmount;
    }

    public double getAmountDeviationRatio() {
        return amountDeviationRatio;
    }

    public long getPriorTxCount() {
        return priorTxCount;
    }

    public boolean isNewDevice() {
        return newDevice;
    }

    public boolean isNewCountry() {
        return newCountry;
    }

    public boolean isHighAmount() {
        return highAmount;
    }

    public boolean isHighRiskMerchant() {
        return highRiskMerchant;
    }

    public List<String> getAnomalyReasons() {
        return anomalyReasons;
    }
}
