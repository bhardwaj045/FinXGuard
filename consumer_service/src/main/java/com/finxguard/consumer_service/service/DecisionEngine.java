package com.finxguard.consumer_service.service;

import java.util.LinkedHashSet;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.finxguard.consumer_service.model.BehavioralFeatures;
import com.finxguard.consumer_service.model.RuleResult;

@Service
public class DecisionEngine implements RiskEvaluator {

    public static class DecisionOutput {
        public final int riskScore;
        public final String decision; // APPROVED, REVIEW, BLOCKED
        public final String reasons;

        public DecisionOutput(int riskScore, String decision, String reasons) {
            this.riskScore = riskScore;
            this.decision = decision;
            this.reasons = reasons;
        }
    }

    @Override
    public double calculateRisk(Double fraudProbability, int ruleScore) {
        double mlComponentScore = (fraudProbability != null) ? fraudProbability * 50.0 : 0.0;
        double ruleComponentScore = ruleScore * 0.50;
        return Math.min(100.0, mlComponentScore + ruleComponentScore);
    }

    @Override
    public DecisionOutput evaluateDecision(
            Double fraudProbability,
            RuleResult ruleResult,
            BehavioralFeatures behavioralFeatures) {

        int mlComponentScore = (fraudProbability != null) ? (int) Math.round(fraudProbability * 50.0) : 0; // 0 to 50
        int ruleComponentScore = ruleResult != null ? (int) Math.round(ruleResult.getRuleScore() * 0.50) : 0; // 0 to 50

        // Additional behavioral anomaly score component using Top-3 Approved Baseline
        int behavioralBonus = 0;
        if (behavioralFeatures != null && behavioralFeatures.getPriorTxCount() > 0) {
            if (behavioralFeatures.isHighAmount() || behavioralFeatures.getAmountDeviationRatio() >= 15.0) {
                behavioralBonus += 30; // Strong risk signal for 15x anomaly
            }
        }

        if (behavioralFeatures != null && behavioralFeatures.isNewDevice() && behavioralFeatures.isNewCountry()) {
            behavioralBonus += 15;
        }

        int combinedRiskScore = Math.min(100, mlComponentScore + ruleComponentScore + behavioralBonus);

        Set<String> combinedReasons = new LinkedHashSet<>();

        // Add ML probability reason only if valid ML probability exists and crosses high threshold (>= 0.70)
        if (fraudProbability != null && fraudProbability >= 0.70) {
            combinedReasons.add(String.format("High ML fraud probability (%.0f%%)", fraudProbability * 100));
        }

        if (ruleResult != null && ruleResult.getReasons() != null) {
            combinedReasons.addAll(ruleResult.getReasons());
        }

        if (behavioralFeatures != null && behavioralFeatures.getAnomalyReasons() != null) {
            combinedReasons.addAll(behavioralFeatures.getAnomalyReasons());
        }

        String decision;
        if (combinedRiskScore >= 70 && (fraudProbability != null && fraudProbability >= 0.90)) {
            decision = "BLOCKED";
        }  else if (combinedRiskScore >= 30  || (ruleResult != null  && ruleResult.getReasons() != null && !ruleResult.getReasons().isEmpty())
        || (behavioralFeatures != null
            && !behavioralFeatures.getAnomalyReasons().isEmpty())) {
    decision = "REVIEW";
} else {
            decision = "APPROVED";
        }

        String formattedReasons;
        if (combinedReasons.isEmpty()) {
            formattedReasons = "No fraud indicators detected.";
        } else {
            formattedReasons = "• " + String.join("\n• ", combinedReasons);
        }

        return new DecisionOutput(combinedRiskScore, decision, formattedReasons);
    }
}
