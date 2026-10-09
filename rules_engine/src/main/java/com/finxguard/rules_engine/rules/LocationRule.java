package com.finxguard.rules_engine.rules;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Component
public class LocationRule extends AbstractFraudRule {

    private final StringRedisTemplate redisTemplate;

    public LocationRule(StringRedisTemplate redisTemplate) {
        super("LOCATION_RULE");
        this.redisTemplate = redisTemplate;
    }

    @Override
    public int evaluate(
            String userId,
            Double amount,
            String country,
            String deviceId,
            String merchantCategory) {

        if (country == null || country.trim().isEmpty() || userId == null) return 0;

        String countrySetKey = "user:" + userId + ":countries";
        Long countrySetSize = redisTemplate.opsForSet().size(countrySetKey);
        Boolean isKnownCountry = redisTemplate.opsForSet().isMember(countrySetKey, country);

        // First transaction / first country for this user -> NO risk penalty
        if (countrySetSize == null || countrySetSize == 0) {
            return 0;
        }

        // Unrecognized country for existing user -> +25 risk penalty
        if (Boolean.FALSE.equals(isKnownCountry)) {
            return 25;
        }

        return 0;
    }

    public int evaluate(String userId, String country) {
        return evaluate(userId, null, country, null, null);
    }
}
