package com.example;

import smile.data.DataFrame;
import java.util.Arrays;

public class TestScorer {

    public static void main(String[] args) throws Exception {
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

        FraudScorer scorer = new FraudScorer("model/fraud_model.ser");

        int start = (int) (n * 0.8);
        int count = n - start;
        long[] times = new long[count];
        int tp = 0, fp = 0, fn = 0;

        for (int i = start; i < n; i++) {
            long t0 = System.nanoTime();
            boolean flagged = scorer.isFraud(x[i]);
            times[i - start] = System.nanoTime() - t0;

            boolean actual = classCol[i] == 1.0;
            if (flagged && actual) tp++;
            else if (flagged) fp++;
            else if (actual) fn++;
        }

        Arrays.sort(times);
        System.out.println("Caught " + tp + " of " + (tp + fn) + " fraud, false alarms: " + fp);
        System.out.printf("Latency per transaction: median %.1f us, p99 %.1f us%n",
                times[count / 2] / 1000.0, times[(int) (count * 0.99)] / 1000.0);
    }
}