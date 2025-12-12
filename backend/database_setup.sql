-- Secure students table: only store secure fields here (email, password, phone)
CREATE TABLE IF NOT EXISTS students (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- In production, use proper password hashing
    student_id VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(50) DEFAULT 'student',
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);

-- Public profiles table: contains non-sensitive profile data that can be shared via QR
CREATE TABLE IF NOT EXISTS public_profiles (
    id BIGSERIAL PRIMARY KEY,
    student_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255),
    university VARCHAR(255),
    course VARCHAR(255),
    year VARCHAR(50),
    profile_photo TEXT,
    social_links JSONB,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_public_profiles_student_id ON public_profiles(student_id);

-- Enable Row Level Security (RLS) on the secure table only and leave public_profiles open for public reads
-- Note: RLS and policies should be tailored if you later adopt Supabase Auth. For now, policies are permissive for development.

-- Add trigger to automatically update updated_at timestamp for students
CREATE OR REPLACE FUNCTION update_students_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_students_updated_at();

-- Add trigger for public_profiles
CREATE OR REPLACE FUNCTION update_public_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_public_profiles_updated_at
    BEFORE UPDATE ON public_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_public_profiles_updated_at();
