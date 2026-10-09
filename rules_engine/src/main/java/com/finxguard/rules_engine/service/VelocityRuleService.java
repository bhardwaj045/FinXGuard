package com.finxguard.rules_engine.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.finxguard.rules_engine.model.RuleResult;
import com.finxguard.rules_engine.rules.AbstractFraudRule;
import com.finxguard.rules_engine.rules.VelocityRule;

@Service
public class VelocityRuleService {

    private final List<AbstractFraudRule> rules;
    private final int velocityThreshold;

    public VelocityRuleService(
            List<AbstractFraudRule> rules,
            @Value("${velocity.threshold:5}") int velocityThreshold) {
        this.rules = Objects.requireNonNull(rules, "Fraud rules must be configured");
        this.velocityThreshold = velocityThreshold;
    }

    public RuleResult evaluateRules(
            String userId,
            Double amount,
            String country,
            String deviceId,
            String merchantCategory) {

        int ruleScore = 0;
        List<String> reasons = new ArrayList<>();

        // Polymorphic rule evaluation over List<AbstractFraudRule>
        for (AbstractFraudRule rule : rules) {
            if (rule == null) {
                throw new IllegalStateException("Fraud rule list contains null");
            }
            AbstractFraudRule configuredRule = rule;
            int score = configuredRule instanceof VelocityRule velocityRule
                    ? velocityRule.evaluate(userId, velocityThreshold)
                    : configuredRule.evaluate(userId, amount, country, deviceId, merchantCategory);
            if (score > 0) {
                ruleScore += score;
                reasons.add(mapReasonCode(configuredRule.getRuleName()));
            }
        }

        ruleScore = Math.min(100, ruleScore);
        boolean ruleFlag = ruleScore >= 30;

        return new RuleResult(ruleFlag, ruleScore, reasons);
    }

    private String mapReasonCode(String ruleName) {
        return switch (ruleName) {
            case "VELOCITY_RULE" -> "Multiple transactions detected within a short period.";
            case "AMOUNT_RULE" -> "Unusual transaction amount";
            case "DEVICE_RULE" -> "New device detected.";
            case "LOCATION_RULE" -> "New country location.";
            case "MERCHANT_RULE" -> "Transaction involves a high-risk merchant category.";
            default -> ruleName;
        };
    }

    /** Compatibility helper method */
    public boolean checkVelocity(String userId) {
        RuleResult result = evaluateRules(userId, null, null, null, null);
        return result.isRuleFlag();
    }
}