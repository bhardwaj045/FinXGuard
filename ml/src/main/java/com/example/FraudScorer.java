package com.example;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.ObjectInputStream;

public class FraudScorer {
    private final ModelBundle bundle;

    public FraudScorer() throws Exception {
        this((String) null);
    }

    public FraudScorer(String modelPath) throws Exception {
        ModelBundle loadedBundle = null;

        // 1. Try loading from Classpath resource
        try (InputStream is = FraudScorer.class.getResourceAsStream("/model/fraud_model.ser")) {
            if (is != null) {
                try (ObjectInputStream in = new ObjectInputStream(is)) {
                    loadedBundle = (ModelBundle) in.readObject();
                }
            }
        } catch (Exception ignored) {
        }

        // 2. Fallback to candidate file paths
        if (loadedBundle == null) {
            String[] candidatePaths = {
                modelPath,
                "model/fraud_model.ser",
                "../ml/model/fraud_model.ser",
                "ml/model/fraud_model.ser",
                "D:/FinXGuard/ml/model/fraud_model.ser"
            };

            for (String path : candidatePaths) {
                if (path != null && new File(path).exists()) {
                    try (ObjectInputStream in = new ObjectInputStream(new FileInputStream(path))) {
                        loadedBundle = (ModelBundle) in.readObject();
                        break;
                    } catch (Exception ignored) {
                    }
                }
            }
        }

        this.bundle = loadedBundle;
    }

    public FraudScorer(InputStream inputStream) throws Exception {
        try (ObjectInputStream in = new ObjectInputStream(inputStream)) {
            this.bundle = (ModelBundle) in.readObject();
        }
    }

    public boolean isLoaded() {
        return this.bundle != null;
    }

    /** features = 29 raw values in this order: V1..V28, Amount. Returns fraud probability 0..1 */
    public double score(double[] features) {
        if (bundle == null || features == null || features.length != bundle.mean.length) {
            return 0.0;
        }
        double[] scaled = new double[features.length];
        for (int j = 0; j < features.length; j++) {
            double s = bundle.std[j] == 0 ? 1.0 : bundle.std[j];
            scaled[j] = (features[j] - bundle.mean[j]) / s;
        }
        double[] p = new double[2];
        bundle.model.predict(scaled, p);
        return p[1];
    }

    public double getThreshold() {
        return bundle != null ? bundle.threshold : 0.90;
    }

    public String getModelVersion() {
        return bundle != null && bundle.modelVersion != null ? bundle.modelVersion : "v1";
    }

    public boolean isFraud(double[] features) {
        if (bundle == null) return false;
        return score(features) >= bundle.threshold;
    }
}