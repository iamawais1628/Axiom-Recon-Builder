-- Transactions table (bank and ERP)
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    source VARCHAR(50) NOT NULL, -- 'bank' or 'erp'
    amount DECIMAL(15,2) NOT NULL,
    description TEXT NOT NULL,
    posting_date DATE NOT NULL,
    reference VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Matches table (results of matching)
CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    bank_tx_id INTEGER REFERENCES transactions(id) ON DELETE CASCADE,
    erp_tx_id INTEGER REFERENCES transactions(id) ON DELETE CASCADE,
    confidence DECIMAL(5,2),
    status VARCHAR(50) DEFAULT 'suggested', -- 'suggested', 'confirmed', 'rejected'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_source ON transactions(source);
CREATE INDEX IF NOT EXISTS idx_transactions_amount ON transactions(amount);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_bank_tx ON matches(bank_tx_id);
CREATE INDEX IF NOT EXISTS idx_matches_erp_tx ON matches(erp_tx_id);

-- Test data (optional - comment out if you don't want test data)
-- INSERT INTO transactions (source, amount, description, posting_date)
-- VALUES ('bank', 1000, 'Test Bank Transaction', '2024-01-15');
