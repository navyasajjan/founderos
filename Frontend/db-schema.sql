
-- FOUNDER CONTROL OS: DATABASE SCHEMA (POSTGRESQL)

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users & Auth
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'VIEWER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Human Systems: Roles
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    responsibilities JSONB, 
    access_level VARCHAR(50) DEFAULT 'VIEWER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Human Systems: People
CREATE TABLE people (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role_id UUID REFERENCES roles(id),
    employment_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    manager_id UUID REFERENCES people(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Company Registration
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    cin VARCHAR(50),
    pan VARCHAR(50),
    tan VARCHAR(50),
    gstin VARCHAR(50),
    incorporation_date DATE,
    registered_address TEXT,
    founders JSONB,
    compliance_checklist JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

-- Finance: Expenses
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL, -- Currency is ₹ INR
    type VARCHAR(50) NOT NULL, -- RECURRING, ONE_TIME
    category VARCHAR(50) NOT NULL, -- PAYROLL, TOOL, INFRA, etc.
    billing_cycle VARCHAR(50), -- MONTHLY, ANNUAL, ONE_TIME
    start_date DATE NOT NULL,
    renewal_date DATE,
    linked_record_id UUID, -- tool or person
    payment_method VARCHAR(100),
    notes TEXT,
    decision_id UUID REFERENCES decisions(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Finance: Snapshots
CREATE TABLE finance_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cash_balance DECIMAL(15, 2) NOT NULL,
    captured_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

-- Records & Assets
CREATE TABLE records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    start_date DATE,
    renewal_date DATE,
    cost DECIMAL(15, 2),
    billing_cycle VARCHAR(50),
    payment_method VARCHAR(100),
    primary_owner_id UUID REFERENCES people(id),
    backup_owner_id UUID REFERENCES people(id),
    tags TEXT[],
    notes TEXT,
    decision_log TEXT[],
    risks TEXT[],
    alternatives TEXT[],
    links JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Decisions & Thinking Vault
CREATE TABLE decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    area VARCHAR(100),
    description TEXT,
    trade_offs TEXT,
    mental_models TEXT[],
    outcome TEXT,
    review_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

-- Intelligence
CREATE TABLE assumptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    statement TEXT NOT NULL,
    area VARCHAR(100),
    confidence INT CHECK (confidence BETWEEN 0 AND 100),
    evidence TEXT,
    validation_date DATE,
    outcome TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

CREATE TABLE risks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(100),
    probability INT CHECK (probability BETWEEN 1 AND 5),
    impact INT CHECK (impact BETWEEN 1 AND 5),
    mitigation_plan TEXT,
    owner_id UUID REFERENCES users(id),
    status VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

-- Audit Log
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    module VARCHAR(100) NOT NULL,
    target_id UUID,
    diff JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_records_search ON records USING GIN (to_tsvector('english', name || ' ' || notes));
CREATE INDEX idx_decisions_search ON decisions USING GIN (to_tsvector('english', title || ' ' || description));
CREATE INDEX idx_people_search ON people USING GIN (to_tsvector('english', name || ' ' || email));
CREATE INDEX idx_expenses_search ON expenses USING GIN (to_tsvector('english', name || ' ' || notes));
