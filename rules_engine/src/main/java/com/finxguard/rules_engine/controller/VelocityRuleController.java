package com.finxguard.rules_engine.controller;

import org.springframework.web.bind.annotation.*;

import com.finxguard.rules_engine.service.VelocityRuleService;

@RestController
@RequestMapping("/api/rules")
public class VelocityRuleController {

    private final VelocityRuleService velocityRuleService;

    public VelocityRuleController(VelocityRuleService velocityRuleService) {
        this.velocityRuleService = velocityRuleService;
    }

    @PostMapping("/velocity/{userId}")
    public String checkVelocity(@PathVariable String userId) {

        boolean flagged =
                velocityRuleService.checkVelocity(userId);

        if (flagged) {
            return "FLAGGED";
        }

        return "ALLOWED";
    }
}