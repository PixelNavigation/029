# FIX: Row-Level Security Policy Error

## The Problem
Error: `new row violates row-level security policy`

This happens because Supabase Storage has Row-Level Security (RLS) enabled but no policies are defined to allow uploads.

## The Solution (Choose ONE method)

### Method 1: Quick Fix via SQL Editor (RECOMMENDED)

1. **Go to your Supabase Dashboard**
2. **Click on SQL Editor** (left sidebar)
3. **Click "New Query"**
4. **Copy and paste ALL the content from `fix_storage_policies.sql`**
5. **Click "Run"**

You should see: "Success. No rows returned"

### Method 2: Via Storage Settings UI

1. **Go to Supabase Dashboard → Storage**
2. **Click on `student-profiles` bucket**
3. **Click "Policies" tab**
4. **Click "New Policy"**

Create 4 policies:

**Policy 1: Public Read**
- Name: `Public Access`
- Allowed operation: `SELECT`
- Policy definition: `bucket_id = 'student-profiles'`

**Policy 2: Public Insert**
- Name: `Anyone can upload`
- Allowed operation: `INSERT`
- WITH CHECK: `bucket_id = 'student-profiles'`

**Policy 3: Public Update**
- Name: `Anyone can update`
- Allowed operation: `UPDATE`
- USING: `bucket_id = 'student-profiles'`

**Policy 4: Public Delete** (optional)
- Name: `Anyone can delete`
- Allowed operation: `DELETE`
- USING: `bucket_id = 'student-profiles'`

## Verify the Fix

After running the SQL:

1. **Open terminal in backend folder**
2. **Run the test script:**
   ```bash
   python test_upload.py
   ```

You should see:
```
✓ Upload successful!
  Public URL: https://...
```

## Test in Your App

1. **Restart backend server** (if running)
2. **Try uploading a photo** in student signup
3. **Should work now!** ✅

## What These Policies Do

- **SELECT**: Allows anyone to READ/VIEW uploaded files (needed for public URLs)
- **INSERT**: Allows anyone to UPLOAD new files
- **UPDATE**: Allows anyone to REPLACE existing files
- **DELETE**: Allows anyone to DELETE files (optional, can remove for security)

## Security Note

These policies allow **anonymous access** which is fine for:
- Public profile photos
- Public certificates that need QR verification

For production, you may want to restrict uploads to authenticated users only:
```sql
-- More secure version (only for authenticated users):
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK ( 
    bucket_id = 'student-profiles' 
    AND auth.role() = 'authenticated'
);
```

## Still Not Working?

Check backend terminal for errors and share the exact error message!
