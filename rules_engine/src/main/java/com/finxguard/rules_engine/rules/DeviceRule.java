package com.finxguard.rules_engine.rules;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Component
public class DeviceRule extends AbstractFraudRule {

    private final StringRedisTemplate redisTemplate;

    public DeviceRule(StringRedisTemplate redisTemplate) {
        super("DEVICE_RULE");
        this.redisTemplate = redisTemplate;
    }

    @Override
    public int evaluate(
            String userId,
            Double amount,
            String country,
            String deviceId,
            String merchantCategory) {

        if (deviceId == null || deviceId.trim().isEmpty() || userId == null) return 0;

        String deviceSetKey = "user:" + userId + ":devices";
        Long deviceSetSize = redisTemplate.opsForSet().size(deviceSetKey);
        Boolean isKnownDevice = redisTemplate.opsForSet().isMember(deviceSetKey, deviceId);

        // Rule 1: First transaction / first device for this user -> NO risk penalty
        if (deviceSetSize == null || deviceSetSize == 0) {
            return 0;
        }

        // Rule 2: Unrecognized device for existing user -> +20 risk penalty
        if (Boolean.FALSE.equals(isKnownDevice)) {
            return 20;
        }

        return 0;
    }

    public int evaluate(String userId, String deviceId) {
        return evaluate(userId, null, null, deviceId, null);
    }
}
