# Supabase Storage Troubleshooting Guide

## Common Issues and Solutions

### Issue 1: 500 Internal Server Error on Photo Upload

**Symptoms:**
- Error: "Request failed with status code 500"
- Photo upload fails during student registration
- User gets registered but without profile photo

**Solutions:**

#### Step 1: Check Backend Terminal Logs
Look at your Python backend terminal for detailed error messages. Common errors:

1. **"Bucket not found"**
   ```
   Solution: Create the 'student-profiles' bucket in Supabase Storage
   ```

2. **"Permission denied" or "Unauthorized"**
   ```
   Solution: Check bucket policies (see Step 2 below)
   ```

3. **"Invalid content-type"**
   ```
   Solution: The code now handles this automatically
   ```

#### Step 2: Verify Supabase Bucket Configuration

1. **Go to Supabase Dashboard → Storage**
2. **Check if bucket exists:**
   - Bucket name: `student-profiles`
   - If not found, create it

3. **Bucket Settings:**
   - ✅ Public bucket: **MUST be checked** (allows public read access)
   - File size limit: At least 10MB (recommended 100MB)
   - Allowed MIME types: `image/*, application/pdf`

4. **Bucket Policies:**
   Go to Storage → student-profiles → Policies

   **Policy 1: Public Read Access**
   ```sql
   CREATE POLICY "Public Access"
   ON storage.objects FOR SELECT
   USING ( bucket_id = 'student-profiles' );
   ```

   **Policy 2: Authenticated Insert**
   ```sql
   CREATE POLICY "Authenticated Upload"
   ON storage.objects FOR INSERT
   WITH CHECK ( bucket_id = 'student-profiles' );
   ```

   **Policy 3: Authenticated Update**
   ```sql
   CREATE POLICY "Authenticated Update"
   ON storage.objects FOR UPDATE
   USING ( bucket_id = 'student-profiles' );
   ```

#### Step 3: Verify Environment Variables

Check your `.env` file in the backend folder:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

**Get these from:** Supabase Dashboard → Settings → API

#### Step 4: Test Supabase Connection

Run this in Python terminal:
```python
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_ANON_KEY")

supabase = create_client(url, key)

# Test connection
try:
    buckets = supabase.storage.list_buckets()
    print("Available buckets:", buckets)
    
    # Test upload
    test_data = b"test content"
    result = supabase.storage.from_('student-profiles').upload('test.txt', test_data)
    print("Upload test:", result)
except Exception as e:
    print("Error:", e)
```

#### Step 5: Common Fixes

**Fix 1: Recreate the Bucket**
```
1. Go to Supabase Storage
2. Delete 'student-profiles' bucket (if exists)
3. Create new bucket:
   - Name: student-profiles
   - Public: ✅ YES
4. Add the policies from Step 2
```

**Fix 2: Check Python Supabase Library Version**
```bash
pip install --upgrade supabase
```

Required version: `supabase>=2.0.0`

**Fix 3: Restart Backend Server**
```bash
# Stop the current server (Ctrl+C)
# Then restart
cd backend
python app.py
```

### Issue 2: Photo Uploads but URL Not Saved

**Symptoms:**
- Photo uploads successfully
- URL not showing in student dashboard
- Database has empty profile_photo field

**Solution:**

Check if the signup endpoint properly saves the URL:

```python
# In app.py - signup endpoint should have:
public_profile = {
    'student_id': data['studentId'],
    'name': data.get('name', ''),
    'university': data.get('university', ''),
    'course': data.get('course', ''),
    'year': data.get('year', ''),
    'profile_photo': data.get('profilePhoto', ''),  # ← This must be set
    'social_links': data.get('socialLinks', {}),
    'bio': data.get('bio', '')
}
```

### Issue 3: "Bucket not found" Error

**Quick Fix:**
```sql
-- Run this in Supabase SQL Editor:
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-profiles', 'student-profiles', true)
ON CONFLICT (id) DO NOTHING;
```

Then add the policies from Step 2.

### Issue 4: CORS Errors

**Symptoms:**
- "Access to XMLHttpRequest blocked by CORS policy"

**Solution:**

Update `app.py`:
```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
```

### Verification Checklist

✅ Supabase bucket `student-profiles` exists  
✅ Bucket is set to **Public**  
✅ Bucket policies configured (3 policies)  
✅ Environment variables set correctly  
✅ Backend server running  
✅ No errors in backend terminal  
✅ Frontend API_URL points to backend  

### Still Having Issues?

**Debug Mode:**

1. Check backend terminal output when uploading
2. Look for specific error messages
3. The updated code now prints detailed errors:
   - "Upload error: [specific error]"
   - "Supabase upload error: [specific error]"

**Common Backend Error Messages:**

| Error Message | Solution |
|--------------|----------|
| `Bucket not found` | Create bucket in Supabase |
| `new row violates row-level security policy` | Add bucket policies |
| `Invalid content-type` | Already fixed in code |
| `No such file or directory` | Check folder paths |
| `Connection refused` | Check SUPABASE_URL |
| `Invalid API key` | Check SUPABASE_ANON_KEY |

### Quick Test Command

Run this to test if everything is configured:

```bash
# In backend folder
python -c "from supabase import create_client; import os; from dotenv import load_dotenv; load_dotenv(); print('Supabase URL:', os.getenv('SUPABASE_URL')); print('Key exists:', bool(os.getenv('SUPABASE_ANON_KEY')))"
```

Should output:
```
Supabase URL: https://xxxxx.supabase.co
Key exists: True
```

If you see the exact error message from your backend terminal, I can provide a more specific solution!
