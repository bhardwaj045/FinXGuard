package com.finxguard.rules_engine.rules;

import java.util.Set;

import org.springframework.stereotype.Component;

@Component
public class MerchantRule extends AbstractFraudRule {

    private static final Set<String> HIGH_RISK_CATEGORIES = Set.of(
            "CRYPTO", "CASINO", "GAMBLING", "LUXURY_JEWELRY", "WIRE_TRANSFER"
    );

    public MerchantRule() {
        super("MERCHANT_RULE");
    }

    @Override
    public int evaluate(
            String userId,
            Double amount,
            String country,
            String deviceId,
            String merchantCategory) {

        if (merchantCategory != null && HIGH_RISK_CATEGORIES.contains(merchantCategory.toUpperCase())) {
            return 15; // High risk merchant category
        }
        return 0;
    }

    public int evaluate(String merchantCategory) {
        return evaluate(null, null, null, null, merchantCategory);
    }
}
