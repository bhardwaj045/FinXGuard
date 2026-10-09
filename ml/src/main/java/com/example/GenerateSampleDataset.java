package com.example;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.util.Random;

public class GenerateSampleDataset {

    public static void main(String[] args) throws Exception {
        generateIfMissing("data/creditcard.csv", 5000);
    }

    public static void generateIfMissing(String csvPath, int numRows) throws Exception {
        File file = new File(csvPath);
        if (file.exists() && file.length() > 0) {
            System.out.println("Dataset file already exists at: " + file.getAbsolutePath());
            return;
        }

        if (file.getParentFile() != null) {
            file.getParentFile().mkdirs();
        }

        Random rng = new Random(42);
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(file))) {
            // Header: Time, V1..V28, Amount, Class
            StringBuilder sb = new StringBuilder();
            sb.append("Time");
            for (int i = 1; i <= 28; i++) {
                sb.append(",V").append(i);
            }
            sb.append(",Amount,Class\n");
            writer.write(sb.toString());

            double time = 0.0;
            for (int r = 0; r < numRows; r++) {
                time += rng.nextDouble() * 10.0;
                // ~0.2% fraud rate
                boolean isFraud = (r > 0 && r % 500 == 0) || (rng.nextDouble() < 0.002);
                int label = isFraud ? 1 : 0;

                sb.setLength(0);
                sb.append(String.format("%.1f", time));

                for (int i = 1; i <= 28; i++) {
                    double val = rng.nextGaussian();
                    if (isFraud) {
                        // Introduce subtle shifts for fraud patterns in V14, V17, V12
                        if (i == 14 || i == 17 || i == 12) {
                            val -= 2.5 + rng.nextDouble() * 2.0;
                        } else if (i == 4 || i == 11) {
                            val += 2.0 + rng.nextDouble() * 1.5;
                        }
                    }
                    sb.append(",").append(String.format("%.6f", val));
                }

                double amount = isFraud ? (200.0 + rng.nextDouble() * 800.0) : (5.0 + rng.nextDouble() * 150.0);
                sb.append(",").append(String.format("%.2f", amount));
                sb.append(",").append(label).append("\n");

                writer.write(sb.toString());
            }
        }
        System.out.println("Generated sample creditcard.csv dataset at: " + file.getAbsolutePath() + " (" + numRows + " rows)");
    }
}
