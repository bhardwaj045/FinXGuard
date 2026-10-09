package com.finxguard.consumer_service.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.finxguard.consumer_service.model.RuleResult;
import com.finxguard.consumer_service.model.TransactionEvent;

@Service
public class RuleEngineClient {

    private final RestClient restClient;

    public RuleEngineClient(@Value("${rule.engine.url:http://localhost:8083}") String baseUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    public boolean checkVelocity(String userId) {
        String response = restClient.post()
                .uri("/api/rules/velocity/{userId}", userId)
                .retrieve()
                .body(String.class);

        return "FLAGGED".equalsIgnoreCase(response);
    }

    public RuleResult evaluateRules(TransactionEvent event) {
        try {
            return restClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/api/rules/evaluate")
                            .queryParam("userId", event.getUserId())
                            .queryParam("amount", event.getAmount())
                            .queryParam("country", event.getCountry())
                            .queryParam("deviceId", event.getDeviceId())
                            .queryParam("merchantCategory", event.getMerchantCategory())
                            .build())
                    .retrieve()
                    .body(RuleResult.class);
        } catch (Exception e) {
            System.err.println("Warning: Rules Engine evaluation failed, falling back to basic check: " + e.getMessage());
            boolean flag = checkVelocity(event.getUserId());
            return new RuleResult(flag, flag ? 50 : 0, flag ? java.util.List.of("HIGH_VELOCITY") : java.util.Collections.emptyList());
        }
    }

    public void recordApprovedTransaction(String userId, String deviceId, String country) {
        try {
            restClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/api/rules/trusted-history/register")
                            .queryParam("userId", userId)
                            .queryParam("deviceId", deviceId)
                            .queryParam("country", country)
                            .build())
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            System.err.println("Warning: Failed to register trusted history in Rules Engine: " + e.getMessage());
        }
    }
}