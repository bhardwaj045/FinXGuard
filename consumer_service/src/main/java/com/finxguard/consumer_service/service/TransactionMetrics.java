package com.finxguard.consumer_service.service;

import org.springframework.stereotype.Service;

@Service
public class TransactionMetrics {

    private int processedTransactions = 0;
    private int flaggedTransactions = 0;

    public synchronized void transactionProcessed() {
        processedTransactions++;
    }

    public synchronized void transactionFlagged() {
        flaggedTransactions++;
    }

    public synchronized int getProcessedTransactions() {
        return processedTransactions;
    }

    public synchronized int getFlaggedTransactions() {
        return flaggedTransactions;
    }
}
