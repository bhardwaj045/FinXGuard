CREATE TABLE IF NOT EXISTS transactions (
    id BIGSERIAL PRIMARY KEY,
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    user_id VARCHAR(100),
    amount NUMERIC(12,2) NOT NULL,
    transaction_time TIMESTAMP NOT NULL,
    fraud_probability DOUBLE PRECISION,
    rule_flag BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);