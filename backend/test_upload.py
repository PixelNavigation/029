#!/usr/bin/env python3
"""Test Supabase Storage Upload"""

from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY')

print(f"URL: {SUPABASE_URL}")
print(f"Key: {SUPABASE_ANON_KEY[:20]}...")

# Create client
supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
print("✓ Client created")

# List buckets
try:
    buckets = supabase.storage.list_buckets()
    print(f"\nBuckets found: {len(buckets)}")
    for bucket in buckets:
        print(f"  - {bucket.name} (public: {bucket.public})")
except Exception as e:
    print(f"✗ Error listing buckets: {e}")

# Try to access student-profiles bucket
print("\n--- Testing student-profiles bucket ---")
try:
    storage = supabase.storage.from_('student-profiles')
    print("✓ Storage object created")
    
    # Try to list files
    try:
        files = storage.list()
        print(f"✓ Files in bucket: {len(files)}")
    except Exception as e:
        print(f"✗ Error listing files: {e}")
    
    # Try to upload a test file
    test_content = b"Hello, this is a test file!"
    test_filename = "test_upload.txt"
    
    print(f"\nTrying to upload {test_filename}...")
    try:
        result = storage.upload(
            path=test_filename,
            file=test_content,
            file_options={"content-type": "text/plain"}
        )
        print(f"✓ Upload successful!")
        print(f"  Result: {result}")
        
        # Get public URL
        public_url = storage.get_public_url(test_filename)
        print(f"  Public URL: {public_url}")
        
    except Exception as e:
        print(f"✗ Upload failed: {e}")
        print(f"  Error type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        
except Exception as e:
    print(f"✗ Error accessing bucket: {e}")
    import traceback
    traceback.print_exc()

print("\n--- Diagnosis ---")
print("If you see 'Buckets found: 0', the bucket doesn't exist or API key lacks permissions")
print("If upload fails with 'Bucket not found', create the bucket via SQL (see below)")
print("\nSQL to create bucket:")
print("INSERT INTO storage.buckets (id, name, public) VALUES ('student-profiles', 'student-profiles', true);")
