-- Create certificates table for storing student document metadata
CREATE TABLE IF NOT EXISTS certificates (
    id BIGSERIAL PRIMARY KEY,
    student_id TEXT NOT NULL,
    document_type TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verification_status TEXT DEFAULT 'pending',
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by TEXT,
    verification_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index on student_id for faster queries
CREATE INDEX IF NOT EXISTS idx_certificates_student_id ON certificates(student_id);

-- Add index on verification_status
CREATE INDEX IF NOT EXISTS idx_certificates_verification_status ON certificates(verification_status);

-- Add RLS (Row Level Security) policies
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view their own certificates
CREATE POLICY "Students can view own certificates" ON certificates
    FOR SELECT
    USING (student_id = current_setting('request.jwt.claims', true)::json->>'student_id');

-- Policy: Students can insert their own certificates
CREATE POLICY "Students can insert own certificates" ON certificates
    FOR INSERT
    WITH CHECK (student_id = current_setting('request.jwt.claims', true)::json->>'student_id');

-- Policy: Public read access (for QR code verification)
CREATE POLICY "Public read access for verification" ON certificates
    FOR SELECT
    USING (true);

-- Policy: Admin can update verification status
CREATE POLICY "Admins can update certificates" ON certificates
    FOR UPDATE
    USING (current_setting('request.jwt.claims', true)::json->>'role' = 'admin');

-- Add comments for documentation
COMMENT ON TABLE certificates IS 'Stores student certificate and document metadata with Supabase Storage URLs';
COMMENT ON COLUMN certificates.student_id IS 'Reference to student ID from students table';
COMMENT ON COLUMN certificates.file_url IS 'Public URL from Supabase Storage';
COMMENT ON COLUMN certificates.verification_status IS 'Status: pending, verified, rejected, expired';
