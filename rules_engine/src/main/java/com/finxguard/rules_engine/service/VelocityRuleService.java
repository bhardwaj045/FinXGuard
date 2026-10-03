package com.finxguard.rules_engine.service;

import java.time.Duration;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class VelocityRuleService {

    private final StringRedisTemplate redisTemplate;

    public VelocityRuleService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public boolean checkVelocity(String userId) {

        String key = "transaction_count:" + userId;

        Long count = redisTemplate.opsForValue().increment(key);

        // Start a 1-minute window for the first transaction
        if (count != null && count == 1) {
            redisTemplate.expire(key, Duration.ofMinutes(5));
        }

        // More than 3 transactions in 1 minute = suspicious
        return count != null && count > 3;
    }
}