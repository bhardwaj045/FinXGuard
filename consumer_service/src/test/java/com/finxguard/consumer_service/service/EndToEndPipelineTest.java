package com.finxguard.consumer_service.service;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.finxguard.consumer_service.model.BehavioralFeatures;
import com.finxguard.consumer_service.model.RuleResult;
import com.finxguard.consumer_service.model.TransactionEvent;
import com.finxguard.consumer_service.repository.TransactionRepository;

public class EndToEndPipelineTest {

    @Test
    void testScenario1_NormalTransaction_ExpectApproved() {
        TransactionRepository txRepo = mock(TransactionRepository.class);
        when(txRepo.countByUserId("user_norm")).thenReturn(10L);
        when(txRepo.findAverageAmountByUserId("user_norm")).thenReturn(1200.0);
        when(txRepo.findDistinctDeviceIdsByUserId("user_norm")).thenReturn(List.of("dev_001"));
        when(txRepo.findDistinctCountriesByUserId("user_norm")).thenReturn(List.of("IN"));

        FeatureEngineeringService feService = new FeatureEngineeringService(txRepo);
        DecisionEngine decisionEngine = new DecisionEngine();

        TransactionEvent event = new TransactionEvent();
        event.setTransactionId("tx_norm_1");
        event.setUserId("user_norm");
        event.setAmount(1000.0);
        event.setCountry("IN");
        event.setDeviceId("dev_001");
        event.setMerchantCategory("RETAIL");

        BehavioralFeatures features = feService.extractBehavioralFeatures(event);
        RuleResult ruleResult = new RuleResult(false, 0, List.of());

        DecisionEngine.DecisionOutput output = decisionEngine.evaluateDecision(0.02, ruleResult, features);

        System.out.println("=== Test Scenario 1 (Normal) ===");
        System.out.println("Decision: " + output.decision + " (Risk: " + output.riskScore + "/100)");
        System.out.println("Reasons:  " + output.reasons);

        assertEquals("APPROVED", output.decision);
        assertTrue(output.riskScore < 30);
    }

    @Test
    void testScenario2_UnusualAmountSpike_ExpectBehavioralReason() {
        TransactionRepository txRepo = mock(TransactionRepository.class);
        when(txRepo.findTop3ApprovedAmountsByUserId("user_spike")).thenReturn(List.of(1000.0, 1000.0, 1000.0));
        when(txRepo.findDistinctDeviceIdsByUserId("user_spike")).thenReturn(List.of("dev_001"));
        when(txRepo.findDistinctCountriesByUserId("user_spike")).thenReturn(List.of("IN"));

        FeatureEngineeringService feService = new FeatureEngineeringService(txRepo);
        DecisionEngine decisionEngine = new DecisionEngine();

        TransactionEvent event = new TransactionEvent();
        event.setTransactionId("tx_spike_1");
        event.setUserId("user_spike");
        event.setAmount(15000.0); // 15x user average baseline
        event.setCountry("IN");
        event.setDeviceId("dev_001");
        event.setMerchantCategory("RETAIL");

        BehavioralFeatures features = feService.extractBehavioralFeatures(event);
        RuleResult ruleResult = new RuleResult(false, 0, List.of());

        DecisionEngine.DecisionOutput output = decisionEngine.evaluateDecision(0.10, ruleResult, features);

        System.out.println("=== Test Scenario 2 (Unusual Amount) ===");
        System.out.println("Decision: " + output.decision + " (Risk: " + output.riskScore + "/100)");
        System.out.println("Reasons:  " + output.reasons);

        assertTrue(output.reasons.contains("Transaction amount is significantly higher than your usual spending."));
        assertTrue(output.riskScore >= 15);
    }

    @Test
    void testScenario3_NewDevice_ExpectUnrecognizedDeviceReason() {
        TransactionRepository txRepo = mock(TransactionRepository.class);
        when(txRepo.findTop3ApprovedAmountsByUserId("user_dev")).thenReturn(List.of(1500.0));
        when(txRepo.findDistinctDeviceIdsByUserId("user_dev")).thenReturn(List.of("dev_known_1"));
        when(txRepo.findDistinctCountriesByUserId("user_dev")).thenReturn(List.of("IN"));

        FeatureEngineeringService feService = new FeatureEngineeringService(txRepo);
        DecisionEngine decisionEngine = new DecisionEngine();

        TransactionEvent event = new TransactionEvent();
        event.setTransactionId("tx_dev_1");
        event.setUserId("user_dev");
        event.setAmount(1500.0);
        event.setCountry("IN");
        event.setDeviceId("dev_unrecognized_999");
        event.setMerchantCategory("RETAIL");

        BehavioralFeatures features = feService.extractBehavioralFeatures(event);
        RuleResult ruleResult = new RuleResult(true, 20, List.of("New device detected."));

        DecisionEngine.DecisionOutput output = decisionEngine.evaluateDecision(0.05, ruleResult, features);

        System.out.println("=== Test Scenario 3 (New Device) ===");
        System.out.println("Decision: " + output.decision + " (Risk: " + output.riskScore + "/100)");
        System.out.println("Reasons:  " + output.reasons);

        assertTrue(output.reasons.contains("New device detected."));
        assertEquals("REVIEW", output.decision);
    }

    @Test
    void testScenario4_NewCountry_ExpectUnrecognizedCountryReason() {
        TransactionRepository txRepo = mock(TransactionRepository.class);
        when(txRepo.findTop3ApprovedAmountsByUserId("user_loc")).thenReturn(List.of(2000.0));
        when(txRepo.findDistinctDeviceIdsByUserId("user_loc")).thenReturn(List.of("dev_001"));
        when(txRepo.findDistinctCountriesByUserId("user_loc")).thenReturn(List.of("IN"));

        FeatureEngineeringService feService = new FeatureEngineeringService(txRepo);
        DecisionEngine decisionEngine = new DecisionEngine();

        TransactionEvent event = new TransactionEvent();
        event.setTransactionId("tx_loc_1");
        event.setUserId("user_loc");
        event.setAmount(2000.0);
        event.setCountry("US");
        event.setDeviceId("dev_001");
        event.setMerchantCategory("RETAIL");

        BehavioralFeatures features = feService.extractBehavioralFeatures(event);
        RuleResult ruleResult = new RuleResult(true, 25, List.of("New country location."));

        DecisionEngine.DecisionOutput output = decisionEngine.evaluateDecision(0.12, ruleResult, features);

        System.out.println("=== Test Scenario 4 (New Country) ===");
        System.out.println("Decision: " + output.decision + " (Risk: " + output.riskScore + "/100)");
        System.out.println("Reasons:  " + output.reasons);

        assertTrue(output.reasons.contains("New country location."));
        assertEquals("REVIEW", output.decision);
    }

    @Test
    void testScenario5_CombinedAttack_ExpectBlockedWithMultipleReasons() {
        TransactionRepository txRepo = mock(TransactionRepository.class);
        when(txRepo.findTop3ApprovedAmountsByUserId("user_victim")).thenReturn(List.of(1500.0, 1500.0, 1500.0));
        when(txRepo.findDistinctDeviceIdsByUserId("user_victim")).thenReturn(List.of("dev_home"));
        when(txRepo.findDistinctCountriesByUserId("user_victim")).thenReturn(List.of("IN"));

        FeatureEngineeringService feService = new FeatureEngineeringService(txRepo);
        DecisionEngine decisionEngine = new DecisionEngine();

        TransactionEvent event = new TransactionEvent();
        event.setTransactionId("tx_attack_1");
        event.setUserId("user_victim");
        event.setAmount(75000.0); // Extreme amount spike (50x)
        event.setCountry("US"); // New country
        event.setDeviceId("dev_attacker_99"); // New device
        event.setMerchantCategory("CASINO"); // High risk merchant

        BehavioralFeatures features = feService.extractBehavioralFeatures(event);
        RuleResult ruleResult = new RuleResult(true, 75, List.of("Multiple transactions detected within a short period.", "New device detected.", "New country location.", "Transaction involves a high-risk merchant category."));

        DecisionEngine.DecisionOutput output = decisionEngine.evaluateDecision(0.95, ruleResult, features);

        System.out.println("=== Test Scenario 5 (Combined Attack) ===");
        System.out.println("Decision: " + output.decision + " (Risk: " + output.riskScore + "/100)");
        System.out.println("Reasons:  " + output.reasons);

        assertEquals("BLOCKED", output.decision);
        assertTrue(output.riskScore >= 70);
        assertTrue(output.reasons.contains("High ML fraud probability (95%)"));
        assertTrue(output.reasons.contains("Transaction amount is significantly higher than your usual spending."));
        assertTrue(output.reasons.contains("New device detected."));
        assertTrue(output.reasons.contains("New country location."));
    }
}
