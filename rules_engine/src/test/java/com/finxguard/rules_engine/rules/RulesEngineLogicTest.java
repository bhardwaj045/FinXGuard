package com.finxguard.rules_engine.rules;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import org.springframework.data.redis.core.SetOperations;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import com.finxguard.rules_engine.model.RuleResult;
import com.finxguard.rules_engine.service.VelocityRuleService;

public class RulesEngineLogicTest {

    // TEST 7: First device is not flagged
    @Test
    void test7_FirstDeviceIsNotFlagged() {
        StringRedisTemplate redisTemplate = mock(StringRedisTemplate.class);
        SetOperations<String, String> setOps = mockSetOperations();
        when(redisTemplate.opsForSet()).thenReturn(setOps);
        when(setOps.size("user:USER_DEV1:devices")).thenReturn(0L);

        DeviceRule deviceRule = new DeviceRule(redisTemplate);
        int penalty = deviceRule.evaluate("USER_DEV1", "DEV_INITIAL");

        assertEquals(0, penalty, "First device for user must return 0 risk penalty");
    }

    // TEST 8: Second transaction with unknown device triggers new-device signal
    @Test
    void test8_UnknownDeviceForExistingUserTriggersNewDeviceSignal() {
        StringRedisTemplate redisTemplate = mock(StringRedisTemplate.class);
        SetOperations<String, String> setOps = mockSetOperations();
        when(redisTemplate.opsForSet()).thenReturn(setOps);
        when(setOps.size("user:USER_DEV2:devices")).thenReturn(1L);
        when(setOps.isMember("user:USER_DEV2:devices", "DEV_NEW")).thenReturn(false);

        DeviceRule deviceRule = new DeviceRule(redisTemplate);
        int penalty = deviceRule.evaluate("USER_DEV2", "DEV_NEW");

        assertEquals(20, penalty, "Unknown device for existing user must return 20 risk penalty");
    }

    // TEST 9: No velocity reason below threshold
    @Test
    void test9_VelocityBelowThreshold_ReturnsZeroRisk() {
        StringRedisTemplate redisTemplate = mock(StringRedisTemplate.class);
        ValueOperations<String, String> valOps = mockValueOperations();
        when(redisTemplate.opsForValue()).thenReturn(valOps);
        when(valOps.increment("velocity:1m:USER_VEL1")).thenReturn(3L);
        when(valOps.increment("velocity:10m:USER_VEL1")).thenReturn(3L);

        VelocityRule velocityRule = new VelocityRule(redisTemplate);
        int penalty = velocityRule.evaluate("USER_VEL1", 5);

        assertEquals(0, penalty, "Velocity below threshold (3 <= 5) must return 0 risk penalty");
    }

    // TEST 10: Velocity reason when threshold is exceeded
    @Test
    void test10_VelocityExceedingThreshold_TriggersVelocitySignal() {
        StringRedisTemplate redisTemplate = mock(StringRedisTemplate.class);
        ValueOperations<String, String> valOps = mockValueOperations();
        when(redisTemplate.opsForValue()).thenReturn(valOps);
        when(valOps.increment("velocity:1m:USER_VEL2")).thenReturn(6L);

        VelocityRule velocityRule = new VelocityRule(redisTemplate);
        int penalty = velocityRule.evaluate("USER_VEL2", 5);

        assertEquals(30, penalty, "Velocity exceeding threshold (6 > 5) must return 30 risk penalty");

        VelocityRuleService service = new VelocityRuleService(List.of(velocityRule), 5);
        RuleResult result = service.evaluateRules("USER_VEL2", null, null, null, null);

        assertTrue(result.getReasons().contains("Multiple transactions detected within a short period."));
    }

    @Test
    void configuredVelocityThresholdIsUsedByService() {
        StringRedisTemplate redisTemplate = mock(StringRedisTemplate.class);
        ValueOperations<String, String> valOps = mockValueOperations();
        when(redisTemplate.opsForValue()).thenReturn(valOps);
        when(valOps.increment("velocity:1m:USER_VEL3")).thenReturn(6L);
        when(valOps.increment("velocity:10m:USER_VEL3")).thenReturn(1L);

        VelocityRuleService service = new VelocityRuleService(
                List.of(new VelocityRule(redisTemplate)),
                10);
        RuleResult result = service.evaluateRules("USER_VEL3", null, null, null, null);

        assertEquals(0, result.getRuleScore());
        assertTrue(result.getReasons().isEmpty());
    }

    @SuppressWarnings("unchecked")
    private static SetOperations<String, String> mockSetOperations() {
        return mock(SetOperations.class);
    }

    @SuppressWarnings("unchecked")
    private static ValueOperations<String, String> mockValueOperations() {
        return mock(ValueOperations.class);
    }
}
