-- PostgreSQL Database Schema for oTree Proxy Server
-- Run this in your PostgreSQL database (Supabase, Neon, etc.)

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create proxy_links table
CREATE TABLE IF NOT EXISTS proxy_links (
    id SERIAL PRIMARY KEY,
    proxy_id VARCHAR(255) UNIQUE NOT NULL,
    real_url TEXT NOT NULL,
    group_name VARCHAR(255),
    max_uses INTEGER DEFAULT 3,
    current_uses INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) DEFAULT 'admin'
);

-- Create link_usage table
CREATE TABLE IF NOT EXISTS link_usage (
    id SERIAL PRIMARY KEY,
    proxy_id VARCHAR(255) NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    user_ip VARCHAR(45),
    user_fingerprint VARCHAR(255),
    participant_number INTEGER,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_proxy_fingerprint UNIQUE(proxy_id, user_fingerprint)
);

-- Create activity_logs table (optional, for audit trail)
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    action VARCHAR(255) NOT NULL,
    details JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin (change password in production!)
INSERT INTO admins (username, password) 
VALUES ('admin', 'admin123') 
ON CONFLICT (username) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_proxy_links_proxy_id ON proxy_links(proxy_id);
CREATE INDEX IF NOT EXISTS idx_proxy_links_active ON proxy_links(is_active);
CREATE INDEX IF NOT EXISTS idx_link_usage_proxy_id ON link_usage(proxy_id);
CREATE INDEX IF NOT EXISTS idx_link_usage_fingerprint ON link_usage(user_fingerprint);

-- Grant permissions (adjust as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_user;