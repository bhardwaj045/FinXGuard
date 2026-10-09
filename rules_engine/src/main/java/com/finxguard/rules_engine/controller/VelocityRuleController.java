package com.finxguard.rules_engine.controller;

import org.springframework.web.bind.annotation.*;

import com.finxguard.rules_engine.model.RuleResult;
import com.finxguard.rules_engine.service.VelocityRuleService;

@RestController
@RequestMapping("/api/rules")
public class VelocityRuleController {

    private final VelocityRuleService velocityRuleService;
    private final com.finxguard.rules_engine.service.TrustedHistoryService trustedHistoryService;

    public VelocityRuleController(
            VelocityRuleService velocityRuleService,
            com.finxguard.rules_engine.service.TrustedHistoryService trustedHistoryService) {
        this.velocityRuleService = velocityRuleService;
        this.trustedHistoryService = trustedHistoryService;
    }

    @PostMapping("/velocity/{userId}")
    public String checkVelocity(@PathVariable String userId) {
        boolean flagged = velocityRuleService.checkVelocity(userId);
        return flagged ? "FLAGGED" : "ALLOWED";
    }

    @PostMapping("/evaluate")
    public RuleResult evaluateRules(
            @RequestParam String userId,
            @RequestParam(required = false) Double amount,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String deviceId,
            @RequestParam(required = false) String merchantCategory) {

        return velocityRuleService.evaluateRules(userId, amount, country, deviceId, merchantCategory);
    }

    @PostMapping("/trusted-history/register")
    public void registerTrustedHistory(
            @RequestParam String userId,
            @RequestParam(required = false) String deviceId,
            @RequestParam(required = false) String country) {

        trustedHistoryService.registerTrustedHistory(userId, deviceId, country);
    }
}