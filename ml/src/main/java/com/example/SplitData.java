package com.example;

import smile.data.DataFrame;
import smile.data.type.DataTypes;
import smile.data.type.StructField;
import smile.data.type.StructType;
import smile.io.CSV;
import org.apache.commons.csv.CSVFormat;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

public class SplitData {

    public static class SplitResult {
        public final double[][] xTrain;
        public final int[] yTrain;
        public final double[][] xTest;
        public final int[] yTest;

        public SplitResult(double[][] xTrain, int[] yTrain, double[][] xTest, int[] yTest) {
            this.xTrain = xTrain;
            this.yTrain = yTrain;
            this.xTest = xTest;
            this.yTest = yTest;
        }
    }

    public static void main(String[] args) throws Exception {
        DataFrame df = load("data/creditcard.csv");
        int n = df.nrow();

        String[] featureNames = new String[29];
        for (int i = 0; i < 28; i++) featureNames[i] = "V" + (i + 1);
        featureNames[28] = "Amount";

        double[][] x = new double[n][featureNames.length];
        for (int j = 0; j < featureNames.length; j++) {
            double[] col = df.column(featureNames[j]).toDoubleArray();
            for (int i = 0; i < n; i++) x[i][j] = col[i];
        }
        double[] classCol = df.column("Class").toDoubleArray();
        int[] y = new int[n];
        for (int i = 0; i < n; i++) y[i] = (int) classCol[i];

        // Stratified split: 80% train, 20% test maintaining exact class ratio
        SplitResult split = stratifiedSplit(x, y, 0.80, 42L);

        System.out.println("Stratified Train rows: " + split.xTrain.length + ", fraud: " + countFraud(split.yTrain));
        System.out.println("Stratified Test rows:  " + split.xTest.length + ", fraud: " + countFraud(split.yTest));
    }

    public static SplitResult stratifiedSplit(double[][] x, int[] y, double trainRatio, long seed) {
        List<Integer> fraudIdx = new ArrayList<>();
        List<Integer> normalIdx = new ArrayList<>();
        for (int i = 0; i < y.length; i++) {
            if (y[i] == 1) fraudIdx.add(i); else normalIdx.add(i);
        }

        Collections.shuffle(fraudIdx, new Random(seed));
        Collections.shuffle(normalIdx, new Random(seed));

        int trainFraudCount = (int) (fraudIdx.size() * trainRatio);
        int trainNormalCount = (int) (normalIdx.size() * trainRatio);

        List<Integer> trainIndices = new ArrayList<>(fraudIdx.subList(0, trainFraudCount));
        trainIndices.addAll(normalIdx.subList(0, trainNormalCount));
        Collections.shuffle(trainIndices, new Random(seed));

        List<Integer> testIndices = new ArrayList<>(fraudIdx.subList(trainFraudCount, fraudIdx.size()));
        testIndices.addAll(normalIdx.subList(trainNormalCount, normalIdx.size()));
        Collections.shuffle(testIndices, new Random(seed));

        double[][] xTrain = new double[trainIndices.size()][];
        int[] yTrain = new int[trainIndices.size()];
        for (int i = 0; i < trainIndices.size(); i++) {
            int idx = trainIndices.get(i);
            xTrain[i] = x[idx];
            yTrain[i] = y[idx];
        }

        double[][] xTest = new double[testIndices.size()][];
        int[] yTest = new int[testIndices.size()];
        for (int i = 0; i < testIndices.size(); i++) {
            int idx = testIndices.get(i);
            xTest[i] = x[idx];
            yTest[i] = y[idx];
        }

        return new SplitResult(xTrain, yTrain, xTest, yTest);
    }

    static int countFraud(int[] y) {
        int c = 0;
        for (int v : y) if (v == 1) c++;
        return c;
    }

    static DataFrame load(String path) throws Exception {
        String resolvedPath = path;
        String[] candidates = {
            path,
            "data/creditcard.csv",
            "../data/creditcard.csv",
            "ml/data/creditcard.csv",
            "producer-service/data/creditcard.csv"
        };
        for (String c : candidates) {
            if (c != null && new java.io.File(c).exists()) {
                resolvedPath = c;
                break;
            }
        }

        java.io.File target = new java.io.File(resolvedPath);
        if (!target.exists()) {
            throw new java.io.FileNotFoundException("Dataset file creditcard.csv not found. Please place creditcard.csv into data/creditcard.csv or ml/data/creditcard.csv (Checked candidate paths: " + java.util.Arrays.toString(candidates) + ")");
        }

        StructField[] fields = new StructField[31];
        fields[0] = new StructField("Time", DataTypes.DoubleType);
        for (int i = 1; i <= 28; i++) {
            fields[i] = new StructField("V" + i, DataTypes.DoubleType);
        }
        fields[29] = new StructField("Amount", DataTypes.DoubleType);
        fields[30] = new StructField("Class", DataTypes.DoubleType);

        CSVFormat format = CSVFormat.DEFAULT.builder()
                .setHeader()
                .setSkipHeaderRecord(true)
                .build();

        return new CSV(format).schema(new StructType(fields)).read(resolvedPath);
    }
}