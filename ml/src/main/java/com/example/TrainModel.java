package com.example;

import smile.classification.LogisticRegression;
import smile.data.DataFrame;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Random;

public class TrainModel {

    public static void main(String[] args) throws Exception {
        // ---- 1. Load and split (same as Stage 2) ----
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

        int trainSize = (int) (n * 0.8);
        double[][] xTrain = Arrays.copyOfRange(x, 0, trainSize);
        int[] yTrain = Arrays.copyOfRange(y, 0, trainSize);
        double[][] xTest = Arrays.copyOfRange(x, trainSize, n);
        int[] yTest = Arrays.copyOfRange(y, trainSize, n);

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

        // ---- 3. Balance the training data (undersample normal transactions) ----
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
        System.out.println("Training on " + xSmall.length + " rows ("
                + fraudIdx.size() + " fraud, " + keepNormal + " normal)");

        // ---- 4. Train ----
        LogisticRegression model = LogisticRegression.fit(xSmall, ySmall);

        // ---- 5. Score every test transaction: probability of fraud ----
        double[] probs = new double[xTest.length];
        for (int i = 0; i < xTest.length; i++) {
            double[] p = new double[2];
            model.predict(xTest[i], p);
            probs[i] = p[1];
        }

        // ---- 6. Evaluate at different thresholds ----
        double[] thresholds = {0.5, 0.7, 0.9, 0.95};
        for (double t : thresholds) {
            int tp = 0, fp = 0, fn = 0, tn = 0;
            for (int i = 0; i < probs.length; i++) {
                boolean predictedFraud = probs[i] >= t;
                boolean actualFraud = yTest[i] == 1;
                if (predictedFraud && actualFraud) tp++;
                else if (predictedFraud) fp++;
                else if (actualFraud) fn++;
                else tn++;
            }
            double precision = tp + fp == 0 ? 0 : (double) tp / (tp + fp);
            double recall = tp + fn == 0 ? 0 : (double) tp / (tp + fn);
            System.out.printf("Threshold %.2f -> caught %d of %d fraud (recall %.2f), "
                    + "false alarms %d, precision %.2f%n",
                    t, tp, tp + fn, recall, fp, precision);
        }
    }

    static void scale(double[][] data, double[] mean, double[] std) {
        for (double[] row : data) {
            for (int j = 0; j < row.length; j++) {
                row[j] = (row[j] - mean[j]) / std[j];
            }
        }
    }
}