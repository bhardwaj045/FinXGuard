package com.example;

import smile.classification.LogisticRegression;
import java.io.Serializable;

public class ModelBundle implements Serializable {
    private static final long serialVersionUID = 1L;

    public final LogisticRegression model;
    public final double[] mean;
    public final double[] std;
    public final double threshold;

    public ModelBundle(LogisticRegression model, double[] mean, double[] std, double threshold) {
        this.model = model;
        this.mean = mean;
        this.std = std;
        this.threshold = threshold;
    }
}