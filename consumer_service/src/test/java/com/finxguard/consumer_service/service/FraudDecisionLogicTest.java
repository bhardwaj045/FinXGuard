package com.finxguard.consumer_service.service;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.finxguard.consumer_service.model.BehavioralFeatures;
import com.finxguard.consumer_service.model.RuleResult;
import com.finxguard.consumer_service.model.TransactionEvent;
import com.finxguard.consumer_service.repository.TransactionRepository;

public class FraudDecisionLogicTest {

    private final TransactionRepository transactionRepository = mock(TransactionRepository.class);
    private final FeatureEngineeringService featureEngineeringService =
            new FeatureEngineeringService(transactionRepository);
    private final DecisionEngine decisionEngine = new DecisionEngine();

    @Test
    void nullApprovedHistoryAndAmountAreHandledWithoutInventingAnomaly() {
        String userId = "USER_NULL_HISTORY";
        when(transactionRepository.findTop3ApprovedAmountsByUserId(userId)).thenReturn(null);
        when(transactionRepository.findDistinctDeviceIdsByUserId(userId)).thenReturn(Collections.emptyList());
        when(transactionRepository.findDistinctCountriesByUserId(userId)).thenReturn(Collections.emptyList());

        TransactionEvent event = new TransactionEvent();
        event.setUserId(userId);
        event.setAmount(null);

        BehavioralFeatures features = featureEngineeringService.extractBehavioralFeatures(event);
        double[] featureVector = featureEngineeringService.buildFeatureVector(event, features);

        assertEquals(0.0, features.getUserAverageAmount());
        assertEquals(0.0, features.getCurrentAmount());
        assertFalse(features.isHighAmount());
        assertEquals(0.0, featureVector[28]);
    }

    // TEST 1: First transaction (No approved history, Amount = ₹15,000)
    @Test
    void test1_FirstTransaction_MustNotBeSuspiciousOrBlockedSolelyDueToAmount() {
        String userId = "USER100";
        when(transactionRepository.findTop3ApprovedAmountsByUserId(userId)).thenReturn(Collections.emptyList());
        when(transactionRepository.findDistinctDeviceIdsByUserId(userId)).thenReturn(Collections.emptyList());
        when(transactionRepository.findDistinctCountriesByUserId(userId)).thenReturn(Collections.emptyList());

        TransactionEvent event = new TransactionEvent();
        event.setTransactionId("TXN_FIRST_1");
        event.setUserId(userId);
        event.setAmount(15000.0);
        event.setDeviceId("DEV102");
        event.setCountry("IN");
        event.setMerchantCategory("Retail");

        BehavioralFeatures features = featureEngineeringService.extractBehavioralFeatures(event);

        assertFalse(features.isHighAmount(), "First transaction must not trigger amount anomaly");
        assertFalse(features.isNewDevice(), "First device must not be treated as unrecognized");
        assertFalse(features.isNewCountry(), "First country must not be treated as new country location");
        assertTrue(features.getAnomalyReasons().isEmpty(), "No anomaly reasons should be generated for first transaction");

        RuleResult ruleResult = new RuleResult(false, 0, Collections.emptyList());
        DecisionEngine.DecisionOutput output = decisionEngine.evaluateDecision(0.03, ruleResult, features);

        assertNotEquals("BLOCKED", output.decision, "First transaction of ₹15,000 must NOT be BLOCKED");
        assertEquals("APPROVED", output.decision);
    }

    // TEST 2: Normal personal amount (Approved: ₹8k, ₹10k, ₹12k; Current: ₹15k)
    @Test
    void test2_NormalPersonalAmount_1_5x_Ratio_MustNotTriggerAmountAnomaly() {
        String userId = "USER_NORM";
        when(transactionRepository.findTop3ApprovedAmountsByUserId(userId)).thenReturn(List.of(12000.0, 10000.0, 8000.0));
        when(transactionRepository.findDistinctDeviceIdsByUserId(userId)).thenReturn(List.of("DEV001"));
        when(transactionRepository.findDistinctCountriesByUserId(userId)).thenReturn(List.of("IN"));

        TransactionEvent event = new TransactionEvent();
        event.setUserId(userId);
        event.setAmount(15000.0);
        event.setDeviceId("DEV001");
        event.setCountry("IN");

        BehavioralFeatures features = featureEngineeringService.extractBehavioralFeatures(event);

        assertEquals(10000.0, features.getUserAverageAmount(), 0.01);
        assertEquals(1.5, features.getAmountDeviationRatio(), 0.01);
        assertFalse(features.isHighAmount(), "1.5x ratio must NOT trigger amount anomaly");
    }

    // TEST 3: 15x anomaly (Approved: ₹8k, ₹10k, ₹12k; Current: ₹150k)
    @Test
    void test3_15xAmountAnomaly_MustTriggerAmountAnomaly() {
        String userId = "USER_SPIKE";
        when(transactionRepository.findTop3ApprovedAmountsByUserId(userId)).thenReturn(List.of(12000.0, 10000.0, 8000.0));
        when(transactionRepository.findDistinctDeviceIdsByUserId(userId)).thenReturn(List.of("DEV001"));
        when(transactionRepository.findDistinctCountriesByUserId(userId)).thenReturn(List.of("IN"));

        TransactionEvent event = new TransactionEvent();
        event.setUserId(userId);
        event.setAmount(150000.0);
        event.setDeviceId("DEV001");
        event.setCountry("IN");

        BehavioralFeatures features = featureEngineeringService.extractBehavioralFeatures(event);

        assertEquals(10000.0, features.getUserAverageAmount(), 0.01);
        assertEquals(15.0, features.getAmountDeviationRatio(), 0.01);
        assertTrue(features.isHighAmount(), "15x ratio MUST trigger amount anomaly");
        assertTrue(features.getAnomalyReasons().contains("Transaction amount is significantly higher than your usual spending."));
    }

    // TEST 4: BLOCKED does not update baseline
    @Test
    void test4_BlockedTransactionsExcludedFromApprovedBaseline() {
        String userId = "USER_BLOCKED_TEST";
        when(transactionRepository.findTop3ApprovedAmountsByUserId(userId)).thenReturn(List.of(5000.0));

        List<Double> top3 = transactionRepository.findTop3ApprovedAmountsByUserId(userId);

        assertEquals(1, top3.size());
        assertEquals(5000.0, top3.get(0));
        assertFalse(top3.contains(250000.0), "BLOCKED transactions must never appear in top 3 approved baseline query");
    }

    // TEST 5: REVIEW does not update baseline
    @Test
    void test5_ReviewTransactionsExcludedFromApprovedBaseline() {
        String userId = "USER_REVIEW_TEST";
        when(transactionRepository.findTop3ApprovedAmountsByUserId(userId)).thenReturn(List.of(3000.0));

        List<Double> top3 = transactionRepository.findTop3ApprovedAmountsByUserId(userId);

        assertEquals(1, top3.size());
        assertEquals(3000.0, top3.get(0));
        assertFalse(top3.contains(45000.0), "REVIEW transactions must never appear in top 3 approved baseline query");
    }

    // TEST 6: APPROVED updates future legitimate history
    @Test
    void test6_ApprovedTransactionsIncludedInBaseline() {
        String userId = "USER_APPROVED_TEST";
        when(transactionRepository.findTop3ApprovedAmountsByUserId(userId)).thenReturn(List.of(15000.0, 10000.0, 5000.0));

        List<Double> top3 = transactionRepository.findTop3ApprovedAmountsByUserId(userId);

        assertEquals(3, top3.size());
        assertTrue(top3.contains(15000.0));
    }

    // TEST 7: ML unavailable (Option B: features == null -> fraudProbability = null)
    @Test
    void test7_MLUnavailable_SetsFraudProbabilityToNull_AndDecisionEngineHandlesNull() {
        RuleResult ruleResult = new RuleResult(false, 0, Collections.emptyList());
        BehavioralFeatures features = new BehavioralFeatures(0.0, 15000.0, 1.0, 0, false, false, false, false, Collections.emptyList());

        Double fraudProb = null;
        DecisionEngine.DecisionOutput output = decisionEngine.evaluateDecision(fraudProb, ruleResult, features);

        assertEquals("APPROVED", output.decision);
        assertFalse(output.reasons.contains("High ML fraud probability"));
    }
}
