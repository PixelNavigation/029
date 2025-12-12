-- Migration helper: If your existing students table contains public profile columns,
-- use this script to copy them into the new public_profiles table.
-- Run this after you've backed up your database.

-- Example: copy name, university, course, year, profile_photo into public_profiles
-- Dynamic migration: safely copy public profile fields from `students` into `public_profiles`
-- This script checks whether each column exists on `students` before referencing it.
DO $$
DECLARE
  cols TEXT[] := ARRAY['name', 'university', 'course', 'year', 'profile_photo'];
  target_cols TEXT[] := ARRAY['name', 'university', 'course', 'year', 'profile_photo'];
  exists_col BOOLEAN;
  select_exprs TEXT := '';
  insert_cols TEXT := '';
  i INT;
  expr TEXT;
  insert_sql TEXT;
BEGIN
  -- build select expressions and insert column list dynamically
  FOR i IN array_lower(cols,1)..array_upper(cols,1) LOOP
    PERFORM 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'students' AND column_name = cols[i];
    GET DIAGNOSTICS exists_col = ROW_COUNT > 0;

    IF exists_col THEN
      expr := 'COALESCE(' || quote_ident(cols[i]) || ', '''')::text';
    ELSE
      expr := quote_literal('') || '::text';
    END IF;

    IF select_exprs = '' THEN
      select_exprs := expr;
      insert_cols := quote_ident(target_cols[i]);
    ELSE
      select_exprs := select_exprs || ', ' || expr;
      insert_cols := insert_cols || ', ' || quote_ident(target_cols[i]);
    END IF;
  END LOOP;

  -- final insert SQL: student_id, <dynamic cols>, social_links, created_at
  insert_sql := 'INSERT INTO public_profiles (student_id, ' || insert_cols || ', social_links, created_at)'
    || ' SELECT student_id, ' || select_exprs || ', ' || quote_literal('{}') || '::jsonb, created_at FROM students WHERE student_id IS NOT NULL'
    || ' ON CONFLICT (student_id) DO NOTHING;';

  RAISE NOTICE 'Running migration SQL: %', insert_sql;
  EXECUTE insert_sql;
END$$;

-- After migration you may optionally remove public columns from students table.
-- Use the following only after verifying data was copied correctly:
-- ALTER TABLE students DROP COLUMN IF EXISTS name, DROP COLUMN IF EXISTS university, DROP COLUMN IF EXISTS course, DROP COLUMN IF EXISTS year, DROP COLUMN IF EXISTS profile_photo;
