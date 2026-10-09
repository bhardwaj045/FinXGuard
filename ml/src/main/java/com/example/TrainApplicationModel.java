package com.example;

import java.io.File;
import java.io.FileOutputStream;
import java.io.ObjectOutputStream;
import java.util.Random;

import smile.classification.LogisticRegression;

public class TrainApplicationModel {

    public static void main(String[] args) throws Exception {

        System.out.println("=== FinXGuard Application ML Model Training ===");

        final int numLegit = 9500;
        final int numFraud = 500;
        final int total = numLegit + numFraud;
        final int features = 10;

        double[][] x = new double[total][features];
        int[] y = new int[total];

        Random rand = new Random(42);

        // =========================================================
        // 1. LEGITIMATE TRANSACTIONS
        // =========================================================
        for (int i = 0; i < numLegit; i++) {

            double currentAmount;
            long priorApprovedCount;
            double userBaselineAmount;
            double amountDeviationRatio;

            // -----------------------------------------------------
            // First-time users
            // -----------------------------------------------------
            if (rand.nextDouble() < 0.30) {

                priorApprovedCount = 0;
                userBaselineAmount = 0.0;

                // Normal first transaction
                currentAmount = 50.0 + rand.nextDouble() * 4950.0;

                // No personal history => deviation is neutral
                amountDeviationRatio = 1.0;

            }
            // -----------------------------------------------------
            // Existing users
            // -----------------------------------------------------
            else {

                priorApprovedCount = 1 + rand.nextInt(20);

                if (priorApprovedCount >= 3) {

                    // Personal baseline
                    userBaselineAmount =
                            200.0 + rand.nextDouble() * 3000.0;

                    /*
                     * Generate a normal transaction around the
                     * user's normal spending level.
                     *
                     * This prevents the model from learning that
                     * every existing-user transaction is suspicious.
                     */
                    double multiplier =
                            0.50 + rand.nextDouble() * 2.0;

                    currentAmount =
                            userBaselineAmount * multiplier;

                    amountDeviationRatio =
                            currentAmount / userBaselineAmount;

                } else {

                    // Not enough history for personal baseline
                    userBaselineAmount = 0.0;

                    currentAmount =
                            50.0 + rand.nextDouble() * 4950.0;

                    amountDeviationRatio = 1.0;
                }
            }

            // -----------------------------------------------------
            // Other behavioral features
            // -----------------------------------------------------

            int velocityCount = rand.nextInt(4);

            double newDevice =
                    rand.nextDouble() < 0.05 ? 1.0 : 0.0;

            double newCountry =
                    rand.nextDouble() < 0.02 ? 1.0 : 0.0;

            double highRiskMerchant =
                    rand.nextDouble() < 0.03 ? 1.0 : 0.0;

            double channelEncoding;

            double channelRandom = rand.nextDouble();

            if (channelRandom < 0.70) {
                channelEncoding = 1.0;       // WEB
            } else if (channelRandom < 0.90) {
                channelEncoding = 0.5;       // OTHER
            } else {
                channelEncoding = 0.0;       // POS
            }

            /*
             * Important:
             *
             * Legitimate transactions should normally NOT have
             * a 15x personal amount anomaly.
             */
            double highAmount = 0.0;

            x[i] = new double[]{
                    currentAmount,
                    amountDeviationRatio,
                    velocityCount,
                    newDevice,
                    newCountry,
                    highRiskMerchant,
                    channelEncoding,
                    priorApprovedCount,
                    userBaselineAmount,
                    highAmount
            };

            y[i] = 0;
        }

        // =========================================================
        // 2. FRAUDULENT TRANSACTIONS
        // =========================================================
        for (int i = 0; i < numFraud; i++) {

            int idx = numLegit + i;

            /*
             * Fraud transactions have a much wider amount range.
             */
            double currentAmount =
                    15000.0 + rand.nextDouble() * 85000.0;

            /*
             * Existing user baseline.
             */
            double userBaselineAmount =
                    500.0 + rand.nextDouble() * 2000.0;

            /*
             * Large personal spending deviation.
             */
            double amountDeviationRatio =
                    currentAmount /
                    Math.max(userBaselineAmount, 1.0);

            /*
             * Higher velocity.
             */
            int velocityCount =
                    3 + rand.nextInt(10);

            /*
             * New device is common in fraud.
             */
            double newDevice =
                    rand.nextDouble() < 0.85 ? 1.0 : 0.0;

            /*
             * New country is common in fraud.
             */
            double newCountry =
                    rand.nextDouble() < 0.70 ? 1.0 : 0.0;

            /*
             * High-risk merchant category.
             */
            double highRiskMerchant =
                    rand.nextDouble() < 0.60 ? 1.0 : 0.0;

            /*
             * Fraud is more commonly online.
             */
            double channelEncoding =
                    rand.nextDouble() < 0.90
                            ? 1.0
                            : 0.5;

            long priorApprovedCount =
                    rand.nextInt(5);

            double highAmount =
                    amountDeviationRatio >= 15.0
                            ? 1.0
                            : 0.0;

            x[idx] = new double[]{
                    currentAmount,
                    amountDeviationRatio,
                    velocityCount,
                    newDevice,
                    newCountry,
                    highRiskMerchant,
                    channelEncoding,
                    priorApprovedCount,
                    userBaselineAmount,
                    highAmount
            };

            y[idx] = 1;
        }

        // =========================================================
        // 3. STANDARDIZATION
        // =========================================================
        double[] mean = new double[features];
        double[] std = new double[features];

        for (int j = 0; j < features; j++) {

            double sum = 0.0;

            for (int i = 0; i < total; i++) {
                sum += x[i][j];
            }

            mean[j] = sum / total;
        }

        for (int j = 0; j < features; j++) {

            double sum = 0.0;

            for (int i = 0; i < total; i++) {
                double diff = x[i][j] - mean[j];
                sum += diff * diff;
            }

            std[j] = Math.sqrt(sum / total);

            if (std[j] == 0.0) {
                std[j] = 1.0;
            }
        }

        double[][] scaledX = new double[total][features];

        for (int i = 0; i < total; i++) {

            for (int j = 0; j < features; j++) {

                scaledX[i][j] =
                        (x[i][j] - mean[j]) / std[j];
            }
        }

        // =========================================================
        // 4. TRAIN LOGISTIC REGRESSION
        // =========================================================
        LogisticRegression model =
                LogisticRegression.fit(scaledX, y);

        // =========================================================
        // 5. CREATE MODEL BUNDLE
        // =========================================================
        ModelBundle bundle =
                new ModelBundle(
                        model,
                        mean,
                        std,
                        0.50,
                        "app_v1"
                );

        // =========================================================
        // 6. SAVE MODEL
        // =========================================================

        File modelDir =
                new File("model");

        if (!modelDir.exists()) {
            modelDir.mkdirs();
        }

        File modelFile =
                new File(
                        "model/app_fraud_model.ser"
                );

        try (ObjectOutputStream out =
                     new ObjectOutputStream(
                             new FileOutputStream(modelFile))) {

            out.writeObject(bundle);
        }

        // Copy to resources
        File resourceDir =
                new File(
                        "src/main/resources/model"
                );

        if (!resourceDir.exists()) {
            resourceDir.mkdirs();
        }

        File resourceFile =
                new File(
                        resourceDir,
                        "app_fraud_model.ser"
                );

        try (
                java.io.InputStream in =
                        new java.io.FileInputStream(modelFile);

                java.io.OutputStream out =
                        new java.io.FileOutputStream(resourceFile)
        ) {

            byte[] buffer = new byte[8192];

            int length;

            while ((length = in.read(buffer)) != -1) {
                out.write(buffer, 0, length);
            }
        }

        System.out.println(
                "Application Model Trained Successfully."
        );

        System.out.println(
                "Saved app_fraud_model.ser to model/ and src/main/resources/model/"
        );
    }
}