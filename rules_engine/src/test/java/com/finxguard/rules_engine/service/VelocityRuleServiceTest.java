package com.finxguard.rules_engine.service;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import com.finxguard.rules_engine.rules.VelocityRule;

@ExtendWith(MockitoExtension.class)
class VelocityRuleServiceTest {

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    private VelocityRuleService service;

    @BeforeEach
    void setUp() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        VelocityRule velocityRule = new VelocityRule(redisTemplate);
        service = new VelocityRuleService(List.of(velocityRule), 5);
    }

    @Test
    void shouldFlagWhenMoreThanFiveTransactionsOccurWithinSixtySeconds() {
        when(valueOperations.increment("velocity:1m:user-1")).thenReturn(6L);

        boolean flagged = service.checkVelocity("user-1");

        assertThat(flagged).isTrue();
    }

    @Test
    void shouldNotFlagWhenFiveOrFewerTransactionsOccurWithinSixtySeconds() {
        when(valueOperations.increment("velocity:1m:user-1")).thenReturn(5L);
        when(valueOperations.increment("velocity:10m:user-1")).thenReturn(5L);

        boolean flagged = service.checkVelocity("user-1");

        assertThat(flagged).isFalse();
    }
}
