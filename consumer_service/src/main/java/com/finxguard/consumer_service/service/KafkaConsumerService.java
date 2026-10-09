package com.finxguard.consumer_service.service;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.ApplicationFraudScorer;
import com.example.FraudScorer;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.finxguard.consumer_service.client.RuleEngineClient;
import com.finxguard.consumer_service.model.BehavioralFeatures;
import com.finxguard.consumer_service.model.RuleResult;
import com.finxguard.consumer_service.model.Transaction;
import com.finxguard.consumer_service.model.TransactionEvent;
import com.finxguard.consumer_service.repository.TransactionRepository;

@Service
public class KafkaConsumerService {

    private final TransactionRepository transactionRepository;
    private final ObjectMapper objectMapper;
    private final RuleEngineClient ruleEngineClient;
    private final DecisionEngine decisionEngine;
    private final FeatureEngineeringService featureEngineeringService;
    private final RiskAnalysisExecutor riskAnalysisExecutor;
    private final TransactionMetrics transactionMetrics;

    private final FraudScorer fraudScorer;
    private final ApplicationFraudScorer applicationFraudScorer;

    public KafkaConsumerService(
            TransactionRepository transactionRepository,
            ObjectMapper objectMapper,
            RuleEngineClient ruleEngineClient,
            DecisionEngine decisionEngine,
            FeatureEngineeringService featureEngineeringService,
            RiskAnalysisExecutor riskAnalysisExecutor,
            TransactionMetrics transactionMetrics,
            @Value("${ml.model.path:ml/model/fraud_model.ser}") String modelPath) {

        this.transactionRepository = transactionRepository;
        this.objectMapper = objectMapper;
        this.ruleEngineClient = ruleEngineClient;
        this.decisionEngine = decisionEngine;
        this.featureEngineeringService = featureEngineeringService;
        this.riskAnalysisExecutor = riskAnalysisExecutor;
        this.transactionMetrics = transactionMetrics;



        FraudScorer scorer = null;

        try {
            scorer = new FraudScorer(modelPath);

            if (scorer.isLoaded()) {
                System.out.println(
                        "✅ Kaggle FraudScorer model ("
                                + scorer.getModelVersion()
                                + ") loaded successfully into Consumer Service!"
                );
            } else {
                System.out.println(
                        "⚠️ Kaggle FraudScorer model could not be loaded."
                );
            }

        } catch (Exception e) {

            System.err.println(
                    "Warning: Could not initialize Kaggle FraudScorer: "
                            + e.getMessage()
            );
        }

        this.fraudScorer = scorer;



        ApplicationFraudScorer appScorer = null;

        try {
            appScorer = new ApplicationFraudScorer();

            if (appScorer.isLoaded()) {
                System.out.println(
                        "✅ Application FraudScorer model ("
                                + appScorer.getModelVersion()
                                + ") loaded successfully into Consumer Service!"
                );
            } else {
                System.out.println(
                        "⚠️ Application FraudScorer model could not be loaded."
                );
            }

        } catch (Exception e) {

            System.err.println(
                    "Warning: Could not initialize Application FraudScorer: "
                            + e.getMessage()
            );
        }

        this.applicationFraudScorer = appScorer;
    }



    @Transactional
    @KafkaListener(
            topics = "transactions.raw",
            groupId = "finxguard-consumer-group"
    )
    public void consumeTransaction(String message) {

        try {



            TransactionEvent event =
                    objectMapper.readValue(
                            message,
                            TransactionEvent.class
                    );

            Double eventAmount = event.getAmount();
            double amount = eventAmount != null ? eventAmount : 0.0;

            if (transactionRepository.existsByTransactionId(
                    event.getTransactionId())) {

                System.out.println(
                        "Idempotency Check: Transaction "
                                + event.getTransactionId()
                                + " already exists in DB. Skipping."
                );

                return;
            }



            BehavioralFeatures behavioralFeatures =
                    featureEngineeringService
                            .extractBehavioralFeatures(event);



            RuleResult ruleResult =
                    ruleEngineClient.evaluateRules(event);
            if (ruleResult == null) {
                throw new IllegalStateException(
                        "Rules Engine returned no evaluation result for transaction "
                                + event.getTransactionId());
            }



            Double fraudProbability = null;

            String modelVersion = "N/A";



            boolean hasKaggleFeatures =
                    event.getFeatures() != null
                    && event.getFeatures().length == 29;


            if (hasKaggleFeatures) {

                System.out.println(
                        "ML MODEL: Kaggle FraudScorer selected for transaction "
                                + event.getTransactionId()
                );

                if (fraudScorer != null
                        && fraudScorer.isLoaded()) {

                    fraudProbability =
                            fraudScorer.score(
                                    event.getFeatures()
                            );

                    modelVersion =
                            fraudScorer.getModelVersion();

                } else {

                    System.err.println(
                            "Kaggle FraudScorer is not loaded."
                    );
                }

            }


            else {

                System.out.println(
                        "ML MODEL: ApplicationFraudScorer selected for transaction "
                                + event.getTransactionId()
                );

                if (applicationFraudScorer != null
                        && applicationFraudScorer.isLoaded()) {

                    double[] appFeatures =
                            ApplicationFraudScorer.extractFeatureVector(

                                    // 1. Current amount
                                    amount,

                                    // 2. Personal amount deviation
                                    behavioralFeatures
                                            .getAmountDeviationRatio(),

                                    // 3. Velocity count
                                    ruleResult.getVelocityCount(),

                                    // 4. New device
                                    behavioralFeatures
                                            .isNewDevice(),

                                    // 5. New country
                                    behavioralFeatures
                                            .isNewCountry(),

                                    // 6. High-risk merchant
                                    behavioralFeatures
                                            .isHighRiskMerchant(),

                                    // 7. Channel
                                    event.getChannel(),

                                    // 8. Previous approved transactions
                                    behavioralFeatures
                                            .getPriorTxCount(),

                                    // 9. Personal baseline
                                    behavioralFeatures
                                            .getUserAverageAmount(),

                                    // 10. High amount anomaly
                                    behavioralFeatures
                                            .isHighAmount()
                            );

                    fraudProbability =
                            applicationFraudScorer.score(
                                    appFeatures
                            );

                    modelVersion =
                            applicationFraudScorer.getModelVersion();

                } else {

                    System.err.println(
                            "Application FraudScorer is not loaded."
                    );
                }
            }


            DecisionEngine.DecisionOutput decisionOut =
                    decisionEngine.evaluateDecision(
                            fraudProbability,
                            ruleResult,
                            behavioralFeatures
                    );


            Transaction transaction =
                    new Transaction();

            transaction.setTransactionId(
                    event.getTransactionId()
            );

            transaction.setUserId(
                    event.getUserId()
            );

            transaction.setCardId(
                    event.getCardId() != null
                            ? event.getCardId()
                            : "card_" + event.getUserId()
            );

            transaction.setAmount(
                    event.getAmount()
            );

            transaction.setCurrency(
                    event.getCurrency() != null
                            ? event.getCurrency()
                            : "INR"
            );

            transaction.setMerchantId(
                    event.getMerchantId() != null
                            ? event.getMerchantId()
                            : "merchant_101"
            );

            transaction.setMerchantCategory(
                    event.getMerchantCategory() != null
                            ? event.getMerchantCategory()
                            : "RETAIL"
            );

            transaction.setCountry(
                    event.getCountry() != null
                            ? event.getCountry()
                            : "IN"
            );

            transaction.setCity(
                    event.getCity() != null
                            ? event.getCity()
                            : "Mumbai"
            );

            transaction.setDeviceId(
                    event.getDeviceId() != null
                            ? event.getDeviceId()
                            : "device_default"
            );

            transaction.setIpAddress(
                    event.getIpAddress() != null
                            ? event.getIpAddress()
                            : "127.0.0.1"
            );

            transaction.setChannel(
                    event.getChannel() != null
                            ? event.getChannel()
                            : "WEB"
            );

            transaction.setTransactionTime(
                    event.getTransactionTime() != null
                            ? event.getTransactionTime()
                            : LocalDateTime.now()
            );

            transaction.setFraudProbability(
                    fraudProbability
            );

            transaction.setRuleFlag(ruleResult.isRuleFlag());

            transaction.setRuleScore(
                    ruleResult.getRuleScore()
            );

            transaction.setRiskScore(
                    decisionOut.riskScore
            );

            transaction.setDecision(
                    decisionOut.decision
            );

            transaction.setStatus(
                    decisionOut.decision
            );

            transaction.setDecisionReasons(
                    decisionOut.reasons
            );

            transaction.setModelVersion(
                    modelVersion
            );

            transaction.setProcessedAt(
                    LocalDateTime.now()
            );

            transaction.setCreatedAt(
                    LocalDateTime.now()
            );


            transactionRepository.save(
                    transaction
            );


            if ("APPROVED".equals(
                    decisionOut.decision)) {

                ruleEngineClient.recordApprovedTransaction(
                        event.getUserId(),
                        event.getDeviceId(),
                        event.getCountry()
                );
            }

            // =====================================================
            // 10. Update Metrics
            // =====================================================

            transactionMetrics.transactionProcessed();

            if (!"APPROVED".equals(
                    decisionOut.decision)) {

                transactionMetrics.transactionFlagged();
            }

            // =====================================================
            // 11. Async Risk Analysis
            // =====================================================

            riskAnalysisExecutor.submit(() -> {

                System.out.println(
                        "Async Risk Analysis executed on Thread: "
                                + Thread.currentThread().getName()
                                + " for Tx: "
                                + transaction.getTransactionId()
                );

            });


            System.out.println(
                    "================================="
            );

            System.out.println(
                    "Transaction Processed Successfully"
            );

            System.out.println(
                    "Transaction ID:   "
                            + transaction.getTransactionId()
            );

            System.out.println(
                    "User ID:          "
                            + transaction.getUserId()
            );

            System.out.println(
                    "Amount:           "
                            + transaction.getCurrency()
                            + " "
                            + transaction.getAmount()
            );

            System.out.println(
                    "User Baseline Avg:"
                            + String.format(
                                    "%.2f (Deviation: %.1fx)",
                                    behavioralFeatures
                                            .getUserAverageAmount(),
                                    behavioralFeatures
                                            .getAmountDeviationRatio()
                            )
            );

            System.out.println(
                    "Fraud Prob (ML):  "
                            + (
                                fraudProbability != null
                                    ? String.format(
                                            "%.4f",
                                            fraudProbability
                                      )
                                    : "N/A"
                              )
            );

            System.out.println(
                    "ML Model Version: "
                            + modelVersion
            );

            System.out.println(
                    "Rule Score:       "
                            + ruleResult.getRuleScore()
                            + "/100"
            );

            System.out.println(
                    "Combined Risk:    "
                            + decisionOut.riskScore
                            + "/100"
            );

            System.out.println(
                    "Final Decision:   "
                            + decisionOut.decision
            );

            System.out.println(
                    "Reasons:          "
                            + decisionOut.reasons
            );

            System.out.println(
                    "Metrics (Total):  "
                            + transactionMetrics
                                    .getProcessedTransactions()
                            + " (Flagged: "
                            + transactionMetrics
                                    .getFlaggedTransactions()
                            + ")"
            );

            System.out.println(
                    "================================="
            );

        } catch (JsonProcessingException | RuntimeException e) {

            System.err.println(
                    "Error processing transaction "
                            + "(rethrowing for Kafka offset control): "
                            + e.getMessage()
            );

            throw new RuntimeException(
                    "Failed to process transaction event",
                    e
            );
        }
    }
}