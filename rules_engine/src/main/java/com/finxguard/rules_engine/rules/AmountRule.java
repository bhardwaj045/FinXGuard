package com.finxguard.rules_engine.rules;

import org.springframework.stereotype.Component;

@Component
public class AmountRule extends AbstractFraudRule {

    public AmountRule() {
        super("AMOUNT_RULE");
    }

    @Override
    public int evaluate(
            String userId,
            Double amount,
            String country,
            String deviceId,
            String merchantCategory) {

        if (amount == null) return 0;

        // Primary amount anomaly scoring is handled behaviorally in FeatureEngineeringService
        // against the user's historical average (top 3 approved baseline).
        return 0;
    }
}
