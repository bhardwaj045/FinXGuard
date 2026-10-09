package com.finxguard.rules_engine.service;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class TrustedHistoryService {

    private final StringRedisTemplate redisTemplate;

    public TrustedHistoryService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void registerTrustedHistory(String userId, String deviceId, String country) {
        if (userId == null || userId.trim().isEmpty()) return;

        if (deviceId != null && !deviceId.trim().isEmpty()) {
            redisTemplate.opsForSet().add("user:" + userId + ":devices", deviceId);
        }

        if (country != null && !country.trim().isEmpty()) {
            redisTemplate.opsForSet().add("user:" + userId + ":countries", country);
        }
    }
}
