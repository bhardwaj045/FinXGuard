package com.finxguard.consumer_service.client;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class RuleEngineClient {

    private final RestClient restClient;

    public RuleEngineClient() {
        this.restClient = RestClient.builder()
                .baseUrl("http://localhost:8083")
                .build();
    }

    public boolean checkVelocity(String userId) {

        String response = restClient.post()
                .uri("/api/rules/velocity/{userId}", userId)
                .retrieve()
                .body(String.class);

        return "FLAGGED".equalsIgnoreCase(response);
    }
}