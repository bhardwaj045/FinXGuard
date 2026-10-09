package com.finxguard.rules_engine.model;

import java.util.ArrayList;
import java.util.List;

public class RuleResult {
    private boolean ruleFlag;
    private int ruleScore;
    private List<String> reasons = new ArrayList<>();

    public RuleResult() {
    }

    public RuleResult(boolean ruleFlag, int ruleScore, List<String> reasons) {
        this.ruleFlag = ruleFlag;
        this.ruleScore = ruleScore;
        this.reasons = reasons;
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
}
