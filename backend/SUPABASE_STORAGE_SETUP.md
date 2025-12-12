# Supabase Storage Setup for Profile Photos and Certificates

## Step 1: Create Storage Bucket

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New Bucket**
4. Enter bucket name: `student-profiles`
5. Set **Public bucket**: ✅ (checked) - This allows public read access to profile photos and certificates
6. Click **Create bucket**

## Step 2: Set Bucket Policies

After creating the bucket, configure the following policies:

### Policy 1: Allow Public Read Access
- **Operation**: SELECT
- **Policy name**: `Public read access`
- **Target roles**: `public`
- **Policy definition**:
```sql
(bucket_id = 'student-profiles'::text)
```

### Policy 2: Allow Authenticated Upload
- **Operation**: INSERT
- **Policy name**: `Authenticated users can upload`
- **Target roles**: `authenticated`, `anon`
- **Policy definition**:
```sql
(bucket_id = 'student-profiles'::text)
```

### Policy 3: Allow Update/Delete (Optional)
- **Operation**: UPDATE
- **Policy name**: `Authenticated users can update`
- **Target roles**: `authenticated`, `anon`
- **Policy definition**:
```sql
(bucket_id = 'student-profiles'::text)
```

## Step 3: Create Database Table for Certificates

Run the SQL migration file to create the certificates table:

```bash
# From Supabase dashboard SQL Editor, run:
cat backend/create_certificates_table.sql
```

Or manually execute the SQL from `create_certificates_table.sql`

## Step 4: Folder Structure

The application automatically creates the following folder structure:
- `profile_photos/` - Contains all student profile photos
  - Files named: `profile_photos/{studentId}_{uniqueId}.{extension}`
- `certificates/` - Contains all student certificates organized by student
  - `certificates/{studentId}/` - Per-student certificate folder
  - Files named: `{documentType}_{timestamp}_{uniqueId}.{extension}`

## Step 5: Verify Setup

Test the upload by:
1. Run the backend: `python app.py`
2. Run the frontend: `npm run dev`
3. Go to student signup page and upload a photo
4. Go to student dashboard and upload a certificate
5. Check Supabase Storage dashboard to see the uploaded files
6. Check Supabase Table Editor to see certificate metadata

## File Access

### Profile Photos
Publicly accessible via URL:
```
https://{your-project-id}.supabase.co/storage/v1/object/public/student-profiles/profile_photos/{filename}
```

### Certificates
Publicly accessible via URL:
```
https://{your-project-id}.supabase.co/storage/v1/object/public/student-profiles/certificates/{studentId}/{filename}
```

The backend automatically returns these URLs after successful upload.

## Database Schema

The `certificates` table stores:
- `id`: Auto-incrementing primary key
- `student_id`: Reference to student
- `document_type`: Type of certificate (e.g., "10th Certificate", "Degree")
- `file_name`: Original filename
- `file_url`: Supabase Storage public URL
- `file_size`: File size in bytes
- `uploaded_at`: Upload timestamp
- `verification_status`: Status (pending, verified, rejected, expired)
- `verified_at`: Verification timestamp
- `verified_by`: Verifier ID
- `verification_notes`: Additional notes

## Important Notes

- Maximum file size: Defined in `app.py` (currently 100MB)
- Allowed formats: 
  - Profile photos: jpg, jpeg, png
  - Certificates: jpg, jpeg, png, pdf, doc, docx, etc.
- Files are stored with unique names to prevent conflicts
- Certificate metadata is stored in PostgreSQL for querying
- File URLs are generated and stored for easy retrieval

## Security Considerations

For production:
1. Consider making the bucket private and use signed URLs for sensitive documents
2. Add file size validation on storage policies (max 10MB per file recommended)
3. Implement rate limiting for uploads (max 10 uploads per minute per user)
4. Add virus scanning for uploaded files
5. Set expiration policies for old/unused files
6. Implement audit logging for all file operations
7. Add encryption at rest for sensitive certificates
8. Validate file types on both client and server side
