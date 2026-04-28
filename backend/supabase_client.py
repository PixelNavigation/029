import os

from supabase import create_client


_supabase = None


def get_supabase():
    global _supabase
    if _supabase is not None:
        return _supabase

    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_ANON_KEY")

    if not supabase_url or not supabase_key:
        _supabase = None
        return None

    _supabase = create_client(supabase_url, supabase_key)
    return _supabase
