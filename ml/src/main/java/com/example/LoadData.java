package com.example;

import smile.data.DataFrame;
import smile.data.type.DataTypes;
import smile.data.type.StructField;
import smile.data.type.StructType;
import smile.io.CSV;
import org.apache.commons.csv.CSVFormat;

public class LoadData {
    public static void main(String[] args) throws Exception {
        // Tell Smile the type of every column: all 31 are decimal numbers
        StructField[] fields = new StructField[31];
        fields[0] = new StructField("Time", DataTypes.DoubleType);
        for (int i = 1; i <= 28; i++) {
            fields[i] = new StructField("V" + i, DataTypes.DoubleType);
        }
        fields[29] = new StructField("Amount", DataTypes.DoubleType);
        fields[30] = new StructField("Class", DataTypes.DoubleType);
        StructType schema = new StructType(fields);

        CSVFormat format = CSVFormat.DEFAULT.builder()
                .setHeader()
                .setSkipHeaderRecord(true)
                .build();

        DataFrame df = new CSV(format).schema(schema).read("data/creditcard.csv");

        System.out.println("Rows: " + df.nrow());
        System.out.println("Columns: " + df.ncol());

        double[] labels = df.column("Class").toDoubleArray();
        int fraud = 0;
        for (double l : labels) if (l == 1.0) fraud++;

        System.out.println("Fraud: " + fraud);
        System.out.println("Not fraud: " + (labels.length - fraud));
    }
}