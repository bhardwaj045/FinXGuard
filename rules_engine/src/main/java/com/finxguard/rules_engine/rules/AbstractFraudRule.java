package com.finxguard.rules_engine.rules;

public abstract class AbstractFraudRule {

    protected final String ruleName;

    public AbstractFraudRule(String ruleName) {
        this.ruleName = ruleName;
    }

    public String getRuleName() {
        return ruleName;
    }

    public abstract int evaluate(
            String userId,
            Double amount,
            String country,
            String deviceId,
            String merchantCategory);
}
