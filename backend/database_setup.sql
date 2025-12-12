CREATE TABLE IF NOT EXISTS students (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- In production, use proper password hashing
    name VARCHAR(255) NOT NULL,
    student_id VARCHAR(100) UNIQUE NOT NULL,
    university VARCHAR(255) NOT NULL,
    course VARCHAR(255) NOT NULL,
    year VARCHAR(50) NOT NULL,
    aadhar_id VARCHAR(12) NOT NULL,
    apaar_id VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(50) DEFAULT 'student',
    verified BOOLEAN DEFAULT FALSE,
    profile_photo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);

-- Create index on student_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);

-- Enable Row Level Security (RLS)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own data
CREATE POLICY "Users can read own data" ON students
    FOR SELECT
    USING (true); -- For now, allow all reads (adjust based on your security needs)

-- Create policy to allow anyone to insert (signup)
CREATE POLICY "Anyone can signup" ON students
    FOR INSERT
    WITH CHECK (true);

-- Create policy to allow users to update their own data
CREATE POLICY "Users can update own data" ON students
    FOR UPDATE
    USING (true); -- Adjust based on authentication

-- Add trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Optional: Create a view for public student profiles (without sensitive data)
CREATE OR REPLACE VIEW student_profiles AS
SELECT 
    id,
    email,
    name,
    student_id,
    university,
    course,
    year,
    verified,
    profile_photo,
    created_at
FROM students;
