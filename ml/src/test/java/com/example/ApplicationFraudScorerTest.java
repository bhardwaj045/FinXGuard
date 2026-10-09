package com.example;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class ApplicationFraudScorerTest {

    @BeforeAll
    static void setupModel() throws Exception {
        // Ensure model artifact app_fraud_model.ser is trained and generated
        TrainApplicationModel.main(new String[0]);
    }

    @Test
    void test1_ApplicationFraudScorerLoadsSuccessfully() throws Exception {
        ApplicationFraudScorer scorer = new ApplicationFraudScorer("model/app_fraud_model.ser");
        assertTrue(scorer.isLoaded(), "ApplicationFraudScorer should load app_fraud_model.ser");
        assertEquals("app_v1", scorer.getModelVersion(), "Model version should be app_v1");
    }

    @Test
    void test2_DeterministicProbabilityForSameFeatureVector() throws Exception {
        ApplicationFraudScorer scorer = new ApplicationFraudScorer("model/app_fraud_model.ser");
        double[] features = ApplicationFraudScorer.extractFeatureVector(
                15000.0, 15.0, 5, true, true, false, "WEB", 0, 0.0, true
        );

        double prob1 = scorer.score(features);
        double prob2 = scorer.score(features);

        assertEquals(prob1, prob2, 0.00001, "Inference for identical feature vectors must be 100% deterministic");
        assertTrue(prob1 >= 0.0 && prob1 <= 1.0, "Probability must be bounded between 0.0 and 1.0");
    }

    @Test
    void test3_ReactStyleTransactionReceivesNonNullProbability() throws Exception {
        ApplicationFraudScorer scorer = new ApplicationFraudScorer("model/app_fraud_model.ser");
        double[] normalTxFeatures = ApplicationFraudScorer.extractFeatureVector(
                500.0, 1.0, 0, false, false, false, "WEB", 5, 500.0, false
        );

        double prob = scorer.score(normalTxFeatures);
        assertNotNull(prob);
        assertTrue(prob >= 0.0 && prob <= 1.0);
    }
}
