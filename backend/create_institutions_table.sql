-- Create institutions table for university/institution registrations
CREATE TABLE IF NOT EXISTS institutions (
    id BIGSERIAL PRIMARY KEY,
    institution_name VARCHAR(255) NOT NULL,
    institution_code VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    website VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    established_year VARCHAR(10),
    institution_type VARCHAR(100),
    affiliated_board VARCHAR(255),
    contact_person_name VARCHAR(255),
    contact_person_email VARCHAR(255),
    contact_person_phone VARCHAR(20),
    contact_person_designation VARCHAR(100),
    institution_hash VARCHAR(64) NOT NULL,
    role VARCHAR(50) DEFAULT 'institution',
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_institutions_email ON institutions(email);
CREATE INDEX IF NOT EXISTS idx_institutions_code ON institutions(institution_code);
CREATE INDEX IF NOT EXISTS idx_institutions_hash ON institutions(institution_hash);

-- Add trigger to automatically update updated_at timestamp for institutions
CREATE OR REPLACE FUNCTION update_institutions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_institutions_updated_at
    BEFORE UPDATE ON institutions
    FOR EACH ROW
    EXECUTE FUNCTION update_institutions_updated_at();
