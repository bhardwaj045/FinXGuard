package com.finxguard.consumer_service.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.finxguard.consumer_service.model.BehavioralFeatures;
import com.finxguard.consumer_service.model.TransactionEvent;
import com.finxguard.consumer_service.repository.TransactionRepository;

@Service
public class FeatureEngineeringService {

    private final TransactionRepository transactionRepository;

    private static final Set<String> HIGH_RISK_CATEGORIES = Set.of(
            "CASINO", "CRYPTO", "GAMBLING", "LUXURY_JEWELRY", "WIRE_TRANSFER"
    );

    public FeatureEngineeringService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public BehavioralFeatures extractBehavioralFeatures(TransactionEvent event) {
        String userId = event.getUserId() != null ? event.getUserId() : "unknown_user";
        Double eventAmount = event.getAmount();
        double amount = eventAmount != null ? eventAmount : 0.0;

        // 1. Query user's top 3 APPROVED (legitimate) transactions ONLY
        List<Double> top3Approved = transactionRepository.findTop3ApprovedAmountsByUserId(userId);
        int approvedCount = (top3Approved != null) ? top3Approved.size() : 0;

        double userBaselineAvg = 0.0;
        double amountDeviationRatio = 1.0;
        boolean isHighAmount = false;

        if (top3Approved != null && approvedCount >= 3) {
            double sum = 0.0;

            for (Double approvedAmount : top3Approved) {
                sum += approvedAmount != null ? approvedAmount : 0.0;
            }

            userBaselineAvg = sum / 3.0;

            if (userBaselineAvg > 0) {
                amountDeviationRatio = amount / userBaselineAvg;
                isHighAmount = amountDeviationRatio >= 15.0;
            }
        }

        // 2. Query distinct past devices & countries for THIS user
        List<String> pastDevices = Objects.requireNonNull(
                transactionRepository.findDistinctDeviceIdsByUserId(userId),
                "Transaction repository returned null device history");
        List<String> pastCountries = Objects.requireNonNull(
                transactionRepository.findDistinctCountriesByUserId(userId),
                "Transaction repository returned null country history");

        String currentDevice = event.getDeviceId();
        // First transaction / no prior approved history -> Register device, NO new device penalty
        boolean isNewDevice = approvedCount > 0 && currentDevice != null && !currentDevice.trim().isEmpty() && !pastDevices.contains(currentDevice);

        String currentCountry = event.getCountry();
        // First transaction / no prior approved history -> Register country, NO new country penalty
        boolean isNewCountry = approvedCount > 0 && currentCountry != null && !currentCountry.trim().isEmpty() && !pastCountries.contains(currentCountry);

        String category = event.getMerchantCategory() != null ? event.getMerchantCategory().toUpperCase() : "";
        boolean isHighRiskMerchant = HIGH_RISK_CATEGORIES.contains(category);

        // 3. Build explainable anomaly reasons ONLY when thresholds are exceeded
        List<String> anomalyReasons = new ArrayList<>();

        if (isHighAmount) {
            anomalyReasons.add("Transaction amount is significantly higher than your usual spending.");
        }

        if (isNewDevice) {
            anomalyReasons.add("New device detected.");
        }

        if (isNewCountry) {
            anomalyReasons.add("New country location.");
        }

        if (isHighRiskMerchant) {
            anomalyReasons.add("Transaction involves a high-risk merchant category.");
        }

        return new BehavioralFeatures(
                userBaselineAvg,
                amount,
                amountDeviationRatio,
                approvedCount,
                isNewDevice,
                isNewCountry,
                isHighAmount,
                isHighRiskMerchant,
                anomalyReasons
        );
    }

    /**
     * Builds a 29-element feature vector (V1..V28 + Amount) derived from application domain signals
     * when features are not explicitly supplied in the raw event payload.
     */
    public double[] buildFeatureVector(TransactionEvent event, BehavioralFeatures behavioral) {
        double[] features = new double[29];
        Double eventAmount = event.getAmount();
        double amount = eventAmount != null ? eventAmount : 0.0;

        // V1: Normalized Amount Deviation
        double deviation = behavioral != null ? behavioral.getAmountDeviationRatio() : 1.0;
        features[0] = Math.min(10.0, Math.max(-5.0, deviation - 1.0));

        // V2: Device Risk Signal
        features[1] = (behavioral != null && behavioral.isNewDevice()) ? -2.5 : 0.5;

        // V3: Country Location Risk Signal
        features[2] = (behavioral != null && behavioral.isNewCountry()) ? -2.0 : 0.2;

        // V4: High Risk Merchant Category Signal
        features[3] = (behavioral != null && behavioral.isHighRiskMerchant()) ? -3.0 : 0.1;

        // V28: Transaction Amount
        features[28] = amount;

        return features;
    }
}
