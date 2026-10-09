package com.finxguard.consumer_service.service;

import com.finxguard.consumer_service.model.BehavioralFeatures;
import com.finxguard.consumer_service.model.RuleResult;

public interface RiskEvaluator {

    DecisionEngine.DecisionOutput evaluateDecision(
            Double fraudProbability,
            RuleResult ruleResult,
            BehavioralFeatures behavioralFeatures);

    double calculateRisk(Double fraudProbability, int ruleScore);
}
