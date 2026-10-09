package com.finxguard.rules_engine.rules;

import java.time.Duration;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Component
public class VelocityRule extends AbstractFraudRule {

    private final StringRedisTemplate redisTemplate;

    public VelocityRule(StringRedisTemplate redisTemplate) {
        super("VELOCITY_RULE");
        this.redisTemplate = redisTemplate;
    }

    @Override
    public int evaluate(
            String userId,
            Double amount,
            String country,
            String deviceId,
            String merchantCategory) {
        return evaluate(userId, 5);
    }

    public int evaluate(String userId, int threshold) {
        String key1m = "velocity:1m:" + userId;
        Long count1m = redisTemplate.opsForValue().increment(key1m);
        if (count1m != null && count1m == 1) {
            redisTemplate.expire(key1m, Duration.ofSeconds(60));
        }

        String key10m = "velocity:10m:" + userId;
        Long count10m = redisTemplate.opsForValue().increment(key10m);
        if (count10m != null && count10m == 1) {
            redisTemplate.expire(key10m, Duration.ofMinutes(10));
        }

        if (count1m != null && count1m > threshold) {
            return 30; // High 1m velocity
        }
        if (count10m != null && count10m > threshold * 3) {
            return 20; // High 10m velocity
        }
        return 0;
    }
}
