package com.finxguard.consumer_service.model;

import java.util.ArrayList;
import java.util.List;

public class RuleResult {

    private boolean ruleFlag;
    private int ruleScore;
    private List<String> reasons = new ArrayList<>();
    private int velocityCount;

    public RuleResult() {
    }

    public RuleResult(boolean ruleFlag, int ruleScore, List<String> reasons) {
        this.ruleFlag = ruleFlag;
        this.ruleScore = ruleScore;
        this.reasons = reasons;
    }

    public RuleResult(
            boolean ruleFlag,
            int ruleScore,
            List<String> reasons,
            int velocityCount) {

        this.ruleFlag = ruleFlag;
        this.ruleScore = ruleScore;
        this.reasons = reasons;
        this.velocityCount = velocityCount;
    }

    public boolean isRuleFlag() {
        return ruleFlag;
    }

    public void setRuleFlag(boolean ruleFlag) {
        this.ruleFlag = ruleFlag;
    }

    public int getRuleScore() {
        return ruleScore;
    }

    public void setRuleScore(int ruleScore) {
        this.ruleScore = ruleScore;
    }

    public List<String> getReasons() {
        return reasons;
    }

    public void setReasons(List<String> reasons) {
        this.reasons = reasons;
    }

    public int getVelocityCount() {
        return velocityCount;
    }

    public void setVelocityCount(int velocityCount) {
        this.velocityCount = velocityCount;
    }
}