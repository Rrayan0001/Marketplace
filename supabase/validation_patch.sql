-- ============================================
-- SQL PATCH: Strict Input Validation
-- Apply this to an existing database to enforce server-side validation.
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_phone_indian_format_chk'
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT profiles_phone_indian_format_chk
      CHECK (
        phone IS NULL
        OR btrim(phone) ~ '^[6-9][0-9]{9}$'
      ) NOT VALID;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'vendor_profiles_gst_format_chk'
  ) THEN
    ALTER TABLE vendor_profiles
      ADD CONSTRAINT vendor_profiles_gst_format_chk
      CHECK (
        gst_number IS NULL
        OR upper(regexp_replace(btrim(gst_number), '\s+', '', 'g')) ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$'
      ) NOT VALID;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'vendor_profiles_description_len_chk'
  ) THEN
    ALTER TABLE vendor_profiles
      ADD CONSTRAINT vendor_profiles_description_len_chk
      CHECK (
        description IS NULL
        OR char_length(btrim(description)) BETWEEN 30 AND 600
      ) NOT VALID;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'jobs_description_len_chk'
  ) THEN
    ALTER TABLE jobs
      ADD CONSTRAINT jobs_description_len_chk
      CHECK (
        description IS NULL
        OR char_length(btrim(description)) BETWEEN 40 AND 1200
      ) NOT VALID;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'quote_requests'
      AND column_name = 'message'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'quote_requests_message_len_chk'
  ) THEN
    ALTER TABLE quote_requests
      ADD CONSTRAINT quote_requests_message_len_chk
      CHECK (
        message IS NULL
        OR char_length(btrim(message)) BETWEEN 20 AND 500
      ) NOT VALID;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'quote_requests'
      AND column_name = 'details'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'quote_requests_details_len_chk'
  ) THEN
    ALTER TABLE quote_requests
      ADD CONSTRAINT quote_requests_details_len_chk
      CHECK (
        details IS NULL
        OR char_length(btrim(details)) BETWEEN 20 AND 500
      ) NOT VALID;
  END IF;
END $$;
