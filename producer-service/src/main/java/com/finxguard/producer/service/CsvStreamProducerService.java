package com.finxguard.producer.service;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.finxguard.producer.model.TransactionEvent;

@Service
public class CsvStreamProducerService {

    private final KafkaProducerService kafkaProducerService;

    private static final String[] MERCHANTS = {"merchant_amazon", "merchant_flipkart", "merchant_uber", "merchant_crypto_x", "merchant_casino_city"};
    private static final String[] CATEGORIES = {"RETAIL", "E_COMMERCE", "RIDESHARE", "CRYPTO", "CASINO"};
    private static final String[] COUNTRIES = {"IN", "IN", "IN", "US", "SG"};
    private static final String[] CITIES = {"Mumbai", "Delhi", "Bengaluru", "New York", "Singapore"};
    private static final String[] CHANNELS = {"WEB", "MOBILE_APP", "POS", "API"};

    public CsvStreamProducerService(KafkaProducerService kafkaProducerService) {
        this.kafkaProducerService = kafkaProducerService;
    }

    public int streamCsv(String csvPath, int delayMs, int maxRecords) throws Exception {
        File csvFile = resolveCsvFile(csvPath);

        if (csvFile != null && csvFile.exists()) {
            return streamFromFile(csvFile, delayMs, maxRecords);
        } else {
            System.out.println("⚠️ creditcard.csv dataset not found on disk. Generating realistic synthetic live transaction events instead...");
            return streamSyntheticEvents(delayMs, maxRecords);
        }
    }

    private File resolveCsvFile(String preferredPath) {
        String[] candidates = {
            preferredPath,
            "data/creditcard.csv",
            "../data/creditcard.csv",
            "../ml/data/creditcard.csv",
            "producer-service/data/creditcard.csv"
        };
        for (String candidate : candidates) {
            if (candidate != null && !candidate.trim().isEmpty()) {
                File file = new File(candidate);
                if (file.exists() && file.isFile()) {
                    return file;
                }
            }
        }
        return null;
    }

    private int streamFromFile(File file, int delayMs, int maxRecords) throws Exception {
        int count = 0;
        Random rng = new Random();
        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String headerLine = reader.readLine();
            if (headerLine == null) return 0;

            String[] headers = headerLine.split(",");
            Map<String, Integer> colMap = new HashMap<>();
            for (int i = 0; i < headers.length; i++) {
                colMap.put(headers[i].trim().replaceAll("^\"|\"$", ""), i);
            }

            int[] vIndices = new int[28];
            for (int i = 0; i < 28; i++) {
                vIndices[i] = colMap.getOrDefault("V" + (i + 1), i + 1);
            }
            int amountIdx = colMap.getOrDefault("Amount", headers.length >= 30 ? headers.length - 2 : 29);

            String line;
            while ((line = reader.readLine()) != null && (maxRecords <= 0 || count < maxRecords)) {
                String[] parts = line.split(",");
                if (parts.length <= Math.max(amountIdx, vIndices[27])) continue;

                double amount = Double.parseDouble(parts[amountIdx].trim());
                double[] features = new double[29];
                for (int i = 0; i < 28; i++) {
                    features[i] = Double.parseDouble(parts[vIndices[i]].trim());
                }
                features[28] = amount;

                int userNum = Math.abs(parts[vIndices[0]].hashCode()) % 100 + 1;
                String userId = "user_" + userNum;
                String txId = "tx_" + UUID.randomUUID().toString();

                TransactionEvent event = new TransactionEvent(
                        txId,
                        userId,
                        amount,
                        LocalDateTime.now(),
                        features
                );

                // Populate rich payment context
                event.setCardId("card_" + userId + "_4111");
                event.setCurrency("INR");
                int mIdx = rng.nextInt(MERCHANTS.length);
                event.setMerchantId(MERCHANTS[mIdx]);
                event.setMerchantCategory(CATEGORIES[mIdx]);
                event.setCountry(COUNTRIES[rng.nextInt(COUNTRIES.length)]);
                event.setCity(CITIES[rng.nextInt(CITIES.length)]);
                event.setDeviceId("device_" + userId + "_d" + (rng.nextInt(2) + 1));
                event.setIpAddress("192.168.1." + (rng.nextInt(250) + 1));
                event.setChannel(CHANNELS[rng.nextInt(CHANNELS.length)]);

                kafkaProducerService.sendTransaction(event);
                count++;

                if (delayMs > 0) {
                    Thread.sleep(delayMs);
                }
            }
        }
        return count;
    }

    private int streamSyntheticEvents(int delayMs, int maxRecords) throws Exception {
        int targetRecords = maxRecords > 0 ? maxRecords : 50;
        Random rng = new Random();

        for (int count = 0; count < targetRecords; count++) {
            int userNum = rng.nextInt(20) + 1;
            String userId = "user_" + userNum;
            String txId = "tx_synth_" + UUID.randomUUID().toString();
            double amount = Math.round((10.0 + rng.nextDouble() * 500.0) * 100.0) / 100.0;

            double[] features = new double[29];
            for (int i = 0; i < 28; i++) {
                features[i] = rng.nextGaussian();
            }
            features[28] = amount;

            TransactionEvent event = new TransactionEvent(
                    txId,
                    userId,
                    amount,
                    LocalDateTime.now(),
                    features
            );

            event.setCardId("card_" + userId + "_4111");
            event.setCurrency("INR");
            int mIdx = rng.nextInt(MERCHANTS.length);
            event.setMerchantId(MERCHANTS[mIdx]);
            event.setMerchantCategory(CATEGORIES[mIdx]);
            event.setCountry(COUNTRIES[rng.nextInt(COUNTRIES.length)]);
            event.setCity(CITIES[rng.nextInt(CITIES.length)]);
            event.setDeviceId("device_" + userId + "_d" + (rng.nextInt(2) + 1));
            event.setIpAddress("10.0.0." + (rng.nextInt(250) + 1));
            event.setChannel(CHANNELS[rng.nextInt(CHANNELS.length)]);

            kafkaProducerService.sendTransaction(event);

            if (delayMs > 0) {
                Thread.sleep(delayMs);
            }
        }
        return targetRecords;
    }
}
