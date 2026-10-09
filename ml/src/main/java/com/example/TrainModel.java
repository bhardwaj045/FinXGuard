package com.example;

import smile.classification.LogisticRegression;
import smile.data.DataFrame;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

public class TrainModel {

    public static void main(String[] args) throws Exception {
        System.out.println("=== FinXGuard ML Model Training & Evaluation ===");
        System.out.println("Loading Kaggle creditcard.csv dataset...");
        DataFrame df = SplitData.load("data/creditcard.csv");
        int n = df.nrow();

        String[] featureNames = new String[29];
        for (int i = 0; i < 28; i++) featureNames[i] = "V" + (i + 1);
        featureNames[28] = "Amount";
        int d = featureNames.length;

        double[][] x = new double[n][d];
        for (int j = 0; j < d; j++) {
            double[] col = df.column(featureNames[j]).toDoubleArray();
            for (int i = 0; i < n; i++) x[i][j] = col[i];
        }
        double[] classCol = df.column("Class").toDoubleArray();
        int[] y = new int[n];
        for (int i = 0; i < n; i++) y[i] = (int) classCol[i];

        SplitData.SplitResult split = SplitData.stratifiedSplit(x, y, 0.80, 42L);
        double[][] xTrain = split.xTrain;
        int[] yTrain = split.yTrain;
        double[][] xTest = split.xTest;
        int[] yTest = split.yTest;

        System.out.printf("Stratified Split completed: Train rows=%d (fraud=%d), Test rows=%d (fraud=%d)%n",
                xTrain.length, SplitData.countFraud(yTrain), xTest.length, SplitData.countFraud(yTest));

        // ---- 2. Scale: (value - mean) / std, using TRAINING data only ----
        double[] mean = new double[d];
        double[] std = new double[d];
        for (int j = 0; j < d; j++) {
            double sum = 0;
            for (double[] row : xTrain) sum += row[j];
            mean[j] = sum / xTrain.length;
            double sq = 0;
            for (double[] row : xTrain) sq += (row[j] - mean[j]) * (row[j] - mean[j]);
            std[j] = Math.sqrt(sq / xTrain.length);
            if (std[j] == 0) std[j] = 1;
        }
        scale(xTrain, mean, std);
        scale(xTest, mean, std);

        // ---- 3. Balance training data (undersample normal transactions 1:10 ratio) ----
        List<Integer> fraudIdx = new ArrayList<>();
        List<Integer> normalIdx = new ArrayList<>();
        for (int i = 0; i < yTrain.length; i++) {
            if (yTrain[i] == 1) fraudIdx.add(i); else normalIdx.add(i);
        }
        Collections.shuffle(normalIdx, new Random(42));
        int keepNormal = Math.min(normalIdx.size(), fraudIdx.size() * 10);

        List<Integer> chosen = new ArrayList<>(fraudIdx);
        chosen.addAll(normalIdx.subList(0, keepNormal));
        Collections.shuffle(chosen, new Random(42));

        double[][] xSmall = new double[chosen.size()][];
        int[] ySmall = new int[chosen.size()];
        for (int k = 0; k < chosen.size(); k++) {
            xSmall[k] = xTrain[chosen.get(k)];
            ySmall[k] = yTrain[chosen.get(k)];
        }
        System.out.println("Balanced training data: " + xSmall.length + " rows ("
                + fraudIdx.size() + " fraud, " + keepNormal + " normal)");

        // ---- 4. Train Model ----
        LogisticRegression model = LogisticRegression.fit(xSmall, ySmall);

        // ---- 5. Score test set transactions ----
        double[] probs = new double[xTest.length];
        for (int i = 0; i < xTest.length; i++) {
            double[] p = new double[2];
            model.predict(xTest[i], p);
            probs[i] = p[1];
        }

        // ---- 6. Evaluate metrics: Precision, Recall, F1, and AUC-PR ----
        double[] thresholds = {0.5, 0.7, 0.9, 0.95};
        System.out.println("\n--- Performance Evaluation per Threshold ---");
        for (double t : thresholds) {
            Metrics m = evaluateThreshold(probs, yTest, t);
            System.out.printf("Threshold %.2f -> Precision: %.4f, Recall: %.4f, F1-Score: %.4f (TP: %d, FP: %d, FN: %d, TN: %d)%n",
                    t, m.precision, m.recall, m.f1, m.tp, m.fp, m.fn, m.tn);
        }

        // Compute Area Under Precision-Recall Curve (AUC-PR)
        double aucPr = calculateAucPr(probs, yTest);
        System.out.printf("%n=== Overall AUC-PR (Area Under Precision-Recall Curve): %.4f ===%n", aucPr);
    }

    public static class Metrics {
        public int tp, fp, fn, tn;
        public double precision, recall, f1;

        public Metrics(int tp, int fp, int fn, int tn) {
            this.tp = tp;
            this.fp = fp;
            this.fn = fn;
            this.tn = tn;
            this.precision = (tp + fp == 0) ? 0.0 : (double) tp / (tp + fp);
            this.recall = (tp + fn == 0) ? 0.0 : (double) tp / (tp + fn);
            this.f1 = (precision + recall == 0) ? 0.0 : 2 * (precision * recall) / (precision + recall);
        }
    }

    public static Metrics evaluateThreshold(double[] probs, int[] yTest, double threshold) {
        int tp = 0, fp = 0, fn = 0, tn = 0;
        for (int i = 0; i < probs.length; i++) {
            boolean pred = probs[i] >= threshold;
            boolean actual = yTest[i] == 1;
            if (pred && actual) tp++;
            else if (pred) fp++;
            else if (actual) fn++;
            else tn++;
        }
        return new Metrics(tp, fp, fn, tn);
    }

    public static double calculateAucPr(double[] probs, int[] yTest) {
        // Evaluate PR curve points across thresholds 0.01 to 0.99
        int numSteps = 100;
        List<double[]> prPoints = new ArrayList<>(); // [recall, precision]

        for (int i = 0; i <= numSteps; i++) {
            double t = i / (double) numSteps;
            Metrics m = evaluateThreshold(probs, yTest, t);
            prPoints.add(new double[]{m.recall, m.precision});
        }

        // Sort by recall ascending
        prPoints.sort((a, b) -> Double.compare(a[0], b[0]));

        // Trapezoidal integration
        double aucPr = 0.0;
        for (int i = 1; i < prPoints.size(); i++) {
            double rPrev = prPoints.get(i - 1)[0];
            double pPrev = prPoints.get(i - 1)[1];
            double rCurr = prPoints.get(i)[0];
            double pCurr = prPoints.get(i)[1];

            aucPr += (rCurr - rPrev) * (pPrev + pCurr) / 2.0;
        }

        return Math.max(0.0, Math.min(1.0, aucPr));
    }

    static void scale(double[][] data, double[] mean, double[] std) {
        for (double[] row : data) {
            for (int j = 0; j < row.length; j++) {
                row[j] = (row[j] - mean[j]) / std[j];
            }
        }
    }
}