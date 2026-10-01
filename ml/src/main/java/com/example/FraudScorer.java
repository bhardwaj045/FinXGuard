package com.example;

import java.io.FileInputStream;
import java.io.ObjectInputStream;

public class FraudScorer {
    private final ModelBundle bundle;

    public FraudScorer(String modelPath) throws Exception {
        try (ObjectInputStream in = new ObjectInputStream(new FileInputStream(modelPath))) {
            this.bundle = (ModelBundle) in.readObject();
        }
    }

    /** features = 29 raw values in this order: V1..V28, Amount. Returns fraud probability 0..1 */
    public double score(double[] features) {
        double[] scaled = new double[features.length];
        for (int j = 0; j < features.length; j++) {
            scaled[j] = (features[j] - bundle.mean[j]) / bundle.std[j];
        }
        double[] p = new double[2];
        bundle.model.predict(scaled, p);
        return p[1];
    }

    public boolean isFraud(double[] features) {
        return score(features) >= bundle.threshold;
    }
}