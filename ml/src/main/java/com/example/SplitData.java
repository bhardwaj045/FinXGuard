package com.example;

import smile.data.DataFrame;
import smile.data.type.DataTypes;
import smile.data.type.StructField;
import smile.data.type.StructType;
import smile.io.CSV;
import org.apache.commons.csv.CSVFormat;

public class SplitData {

    public static void main(String[] args) throws Exception {
        DataFrame df = load("data/creditcard.csv");
        int n = df.nrow();

        // Features: V1..V28 and Amount (we skip Time, it is not useful for live scoring)
        String[] featureNames = new String[29];
        for (int i = 0; i < 28; i++) featureNames[i] = "V" + (i + 1);
        featureNames[28] = "Amount";

        // Build x (a table of numbers) and y (the answers: 1 = fraud, 0 = not fraud)
        double[][] x = new double[n][featureNames.length];
        for (int j = 0; j < featureNames.length; j++) {
            double[] col = df.column(featureNames[j]).toDoubleArray();
            for (int i = 0; i < n; i++) x[i][j] = col[i];
        }
        double[] classCol = df.column("Class").toDoubleArray();
        int[] y = new int[n];
        for (int i = 0; i < n; i++) y[i] = (int) classCol[i];

        // Split by order: first 80% = training, last 20% = test
        int trainSize = (int) (n * 0.8);

        double[][] xTrain = java.util.Arrays.copyOfRange(x, 0, trainSize);
        int[] yTrain = java.util.Arrays.copyOfRange(y, 0, trainSize);
        double[][] xTest = java.util.Arrays.copyOfRange(x, trainSize, n);
        int[] yTest = java.util.Arrays.copyOfRange(y, trainSize, n);

        System.out.println("Training rows: " + xTrain.length + ", fraud: " + countFraud(yTrain));
        System.out.println("Test rows: " + xTest.length + ", fraud: " + countFraud(yTest));
    }

    static int countFraud(int[] y) {
        int c = 0;
        for (int v : y) if (v == 1) c++;
        return c;
    }

    static DataFrame load(String path) throws Exception {
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

        return new CSV(format).schema(new StructType(fields)).read(path);
    }
}