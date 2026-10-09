package com.example;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class FraudScorerTest {

    @Test
    public void testModelLoadingAndInferenceLatency() throws Exception {
        // Load the trained model bundle from disk
        FraudScorer scorer = new FraudScorer("model/fraud_model.ser");

        // Generate synthetic transaction features (29 values: V1..V28, Amount)
        double[] features = new double[29];
        for (int i = 0; i < 28; i++) {
            features[i] = (i % 2 == 0 ? 0.5 : -0.5);
        }
        features[28] = 150.00; // Amount

        // Warmup
        for (int i = 0; i < 1000; i++) {
            scorer.score(features);
        }

        // Benchmark latency
        int runs = 10000;
        long[] latenciesNs = new long[runs];
        for (int i = 0; i < runs; i++) {
            long t0 = System.nanoTime();
            double prob = scorer.score(features);
            latenciesNs[i] = System.nanoTime() - t0;

            assertTrue(prob >= 0.0 && prob <= 1.0, "Probability must be between 0 and 1");
        }

        java.util.Arrays.sort(latenciesNs);
        double medianUs = latenciesNs[runs / 2] / 1000.0;
        double p99Us = latenciesNs[(int) (runs * 0.99)] / 1000.0;

        System.out.println("==================================================");
        System.out.println("Model Loading: SUCCESS (model/fraud_model.ser loaded)");
        System.out.println("Inference Latency Benchmark (10,000 runs):");
        System.out.printf("  Median Latency: %.3f µs%n", medianUs);
        System.out.printf("  P99 Latency:    %.3f µs%n", p99Us);
        System.out.println("==================================================");

        assertTrue(p99Us < 50.0, "P99 latency should be ultra-low microsecond range");
    }
}
