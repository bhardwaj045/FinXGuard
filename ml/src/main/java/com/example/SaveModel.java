package com.example;

import smile.classification.LogisticRegression;
import smile.data.DataFrame;

import java.io.File;
import java.io.FileOutputStream;
import java.io.ObjectOutputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

public class SaveModel {

    public static void main(String[] args) throws Exception {
        System.out.println("=== FinXGuard ML Model Serialization ===");
        System.out.println("Loading Kaggle creditcard.csv dataset...");
        DataFrame df = SplitData.load("data/creditcard.csv");
        int n = df.nrow();
        int d = 29;

        String[] names = new String[d];
        for (int i = 0; i < 28; i++) names[i] = "V" + (i + 1);
        names[28] = "Amount";

        double[][] x = new double[n][d];
        for (int j = 0; j < d; j++) {
            double[] col = df.column(names[j]).toDoubleArray();
            for (int i = 0; i < n; i++) x[i][j] = col[i];
        }
        double[] classCol = df.column("Class").toDoubleArray();
        int[] y = new int[n];
        for (int i = 0; i < n; i++) y[i] = (int) classCol[i];

        // Stratified split
        SplitData.SplitResult split = SplitData.stratifiedSplit(x, y, 0.80, 42L);
        double[][] xTrain = split.xTrain;
        int[] yTrain = split.yTrain;

        // mean and std from training data
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
        for (double[] row : xTrain) {
            for (int j = 0; j < d; j++) row[j] = (row[j] - mean[j]) / std[j];
        }

        // balance: all fraud + 10x normal
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

        LogisticRegression model = LogisticRegression.fit(xSmall, ySmall);

        ModelBundle bundle = new ModelBundle(model, mean, std, 0.90);

        // Save to file directory
        new File("model").mkdirs();
        try (ObjectOutputStream out = new ObjectOutputStream(new FileOutputStream("model/fraud_model.ser"))) {
            out.writeObject(bundle);
        }

        // Also save to classpath resources directory for embedded bundling
        new File("src/main/resources/model").mkdirs();
        try (ObjectOutputStream out = new ObjectOutputStream(new FileOutputStream("src/main/resources/model/fraud_model.ser"))) {
            out.writeObject(bundle);
        }

        System.out.println("Saved model/fraud_model.ser and src/main/resources/model/fraud_model.ser");
    }
}