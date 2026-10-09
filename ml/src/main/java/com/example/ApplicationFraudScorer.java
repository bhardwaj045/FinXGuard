package com.example;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.ObjectInputStream;

public class ApplicationFraudScorer {
    private final ModelBundle bundle;

    public ApplicationFraudScorer() throws Exception {
        this((String) null);
    }

    public ApplicationFraudScorer(String modelPath) throws Exception {
        ModelBundle loadedBundle = null;

        // 1. Try loading from Classpath resource
        try (InputStream is = ApplicationFraudScorer.class.getResourceAsStream("/model/app_fraud_model.ser")) {
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
                "model/app_fraud_model.ser",
                "../ml/model/app_fraud_model.ser",
                "ml/model/app_fraud_model.ser",
                "D:/FinXGuard/ml/model/app_fraud_model.ser"
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

    public ApplicationFraudScorer(InputStream inputStream) throws Exception {
        try (ObjectInputStream in = new ObjectInputStream(inputStream)) {
            this.bundle = (ModelBundle) in.readObject();
        }
    }

    public boolean isLoaded() {
        return this.bundle != null;
    }

    public String getModelVersion() {
        return bundle != null && bundle.modelVersion != null ? bundle.modelVersion : "app_v1";
    }

    public double getThreshold() {
        return bundle != null ? bundle.threshold : 0.50;
    }

    /**
     * Converts raw application domain attributes into the standardized 10-element feature vector.
     */
    public static double[] extractFeatureVector(
            double currentAmount,
            double amountDeviationRatio,
            int velocityCount,
            boolean newDevice,
            boolean newCountry,
            boolean highRiskMerchant,
            String channel,
            long priorApprovedCount,
            double userBaselineAmount,
            boolean highAmount) {

        double channelEnc = 0.5; // default MOBILE
        if (channel != null) {
            String c = channel.toUpperCase();
            if (c.contains("WEB") || c.contains("ONLINE")) channelEnc = 1.0;
            else if (c.contains("POS")) channelEnc = 0.0;
        }

        return new double[]{
                currentAmount,
                amountDeviationRatio,
                (double) velocityCount,
                newDevice ? 1.0 : 0.0,
                newCountry ? 1.0 : 0.0,
                highRiskMerchant ? 1.0 : 0.0,
                channelEnc,
                (double) priorApprovedCount,
                userBaselineAmount,
                highAmount ? 1.0 : 0.0
        };
    }

    /**
     * Scores a 10-element application feature vector. Returns probability bounded between 0.0 and 1.0.
     */
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
}
