CREATE TABLE IF NOT EXISTS transactions (
    id BIGSERIAL PRIMARY KEY,
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    card_id VARCHAR(100),
    amount NUMERIC(12,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    merchant_id VARCHAR(100),
    merchant_category VARCHAR(100),
    country VARCHAR(50),
    city VARCHAR(50),
    device_id VARCHAR(100),
    ip_address VARCHAR(50),
    channel VARCHAR(20),
    transaction_time TIMESTAMP NOT NULL,
    fraud_probability DOUBLE PRECISION,
    rule_flag BOOLEAN DEFAULT FALSE,
    rule_score INT DEFAULT 0,
    risk_score INT DEFAULT 0,
    status VARCHAR(20) NOT NULL,
    decision VARCHAR(20) NOT NULL,
    decision_reasons TEXT,
    model_version VARCHAR(20) DEFAULT 'v1',
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fraud_feedback (
    id BIGSERIAL PRIMARY KEY,
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    predicted_decision VARCHAR(20) NOT NULL,
    actual_fraud BOOLEAN NOT NULL,
    feedback_source VARCHAR(50) DEFAULT 'USER',
    feedback_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);