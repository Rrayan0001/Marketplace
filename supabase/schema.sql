-- ============================================
-- MARGROS: Database Schema
-- Supabase (PostgreSQL)
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For hyperlocal zone matching

-- ============================================
-- ZONES (Hyperlocal Geographic Regions)
-- ============================================
CREATE TABLE zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  boundary GEOMETRY(POLYGON, 4326), -- Geographic boundary for postgis
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- PROFILES (Extends Supabase Auth users)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('restaurant', 'worker', 'vendor', 'admin')),
  full_name VARCHAR(255),
  phone VARCHAR(20),
  avatar_url TEXT,
  zone_id UUID REFERENCES zones(id),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'blocked')),
  is_verified BOOLEAN DEFAULT false,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- RESTAURANT PROFILES
-- ============================================
CREATE TABLE restaurant_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  restaurant_name VARCHAR(255) NOT NULL,
  cuisine_type VARCHAR(100),
  seating_capacity INTEGER,
  address TEXT,
  food_license_url TEXT,            -- Uploaded food license image
  food_license_number VARCHAR(100),
  food_license_expiry DATE,
  license_verified BOOLEAN DEFAULT false,
  ai_verification_data JSONB,       -- Store Vision LLM extraction results
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- WORKER PROFILES
-- ============================================
CREATE TABLE worker_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  worker_role VARCHAR(50) NOT NULL,  -- chef, waiter, cleaner, kitchen_helper, etc.
  years_experience INTEGER DEFAULT 0,
  current_location TEXT,
  availability VARCHAR(20) CHECK (availability IN ('full_time', 'part_time', 'flexible', 'morning', 'evening', 'night')),
  is_actively_available BOOLEAN DEFAULT false,
  aadhaar_url TEXT,                  -- Uploaded Aadhaar image
  experience_proof_url TEXT,         -- Employment certificate
  aadhaar_verified BOOLEAN DEFAULT false,
  ai_verification_data JSONB,
  expected_salary_min INTEGER,
  expected_salary_max INTEGER,
  skills TEXT[],                     -- Array of skills
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- VENDOR PROFILES
-- ============================================
CREATE TABLE vendor_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  service_category VARCHAR(100) NOT NULL, -- kitchen_equipment, cleaning_supplies, food_packaging, etc.
  gst_certificate_url TEXT,
  gst_number VARCHAR(50),
  gst_verified BOOLEAN DEFAULT false,
  ai_verification_data JSONB,
  operating_zones UUID[],           -- Array of zone IDs they serve
  description TEXT,
  commission_rate DECIMAL(5,2),     -- Admin-set commission percentage
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- JOBS (Posted by Restaurants)
-- ============================================
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurant_profiles(id) ON DELETE CASCADE,
  zone_id UUID REFERENCES zones(id),
  title VARCHAR(255) NOT NULL,
  role_type VARCHAR(50) NOT NULL,   -- chef, waiter, cleaner, etc.
  description TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  shift VARCHAR(20) CHECK (shift IN ('morning', 'evening', 'night', 'flexible', 'full_day')),
  job_type VARCHAR(20) CHECK (job_type IN ('full_time', 'part_time', 'contract', 'temporary')),
  experience_required INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_filled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- JOB APPLICATIONS
-- ============================================
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'applied' CHECK (status IN ('applied', 'shortlisted', 'interview', 'hired', 'rejected', 'withdrawn')),
  cover_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(job_id, worker_id)
);

-- ============================================
-- PLACEMENTS (Active Hires)
-- ============================================
CREATE TABLE placements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id),
  restaurant_id UUID NOT NULL REFERENCES restaurant_profiles(id),
  worker_id UUID NOT NULL REFERENCES worker_profiles(id),
  start_date DATE NOT NULL,
  end_date DATE,
  guarantee_period_days INTEGER DEFAULT 30,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'replaced', 'terminated')),
  exit_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- VENDOR QUOTE REQUESTS
-- ============================================
CREATE TABLE quote_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendor_profiles(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurant_profiles(id) ON DELETE CASCADE,
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'accepted', 'declined')),
  response_text TEXT,
  quoted_amount DECIMAL(12,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- DOCUMENTS (For AI Verification Pipeline)
-- ============================================
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL, -- food_license, aadhaar, gst_certificate, experience_proof
  file_url TEXT NOT NULL,
  ai_status VARCHAR(20) DEFAULT 'pending' CHECK (ai_status IN ('pending', 'processing', 'passed', 'flagged', 'failed')),
  ai_extracted_data JSONB,           -- Extracted fields from Vision LLM
  ai_confidence_score DECIMAL(5,4),
  ai_flags TEXT[],                   -- Array of flagged issues
  admin_status VARCHAR(20) DEFAULT 'pending' CHECK (admin_status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- SUPPORT TICKETS / DISPUTES
-- ============================================
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES profiles(id),
  related_placement_id UUID REFERENCES placements(id),
  category VARCHAR(50) NOT NULL, -- replacement_request, payment_issue, worker_complaint, vendor_dispute
  subject VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  resolution TEXT,
  assigned_to UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- DATA VALIDATION CONSTRAINTS
-- ============================================
ALTER TABLE profiles
  ADD CONSTRAINT profiles_phone_indian_format_chk
  CHECK (
    phone IS NULL
    OR btrim(phone) ~ '^[6-9][0-9]{9}$'
  );

ALTER TABLE vendor_profiles
  ADD CONSTRAINT vendor_profiles_gst_format_chk
  CHECK (
    gst_number IS NULL
    OR upper(regexp_replace(btrim(gst_number), '\s+', '', 'g')) ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$'
  );

ALTER TABLE vendor_profiles
  ADD CONSTRAINT vendor_profiles_description_len_chk
  CHECK (
    description IS NULL
    OR char_length(btrim(description)) BETWEEN 30 AND 600
  );

ALTER TABLE jobs
  ADD CONSTRAINT jobs_description_len_chk
  CHECK (
    description IS NULL
    OR char_length(btrim(description)) BETWEEN 40 AND 1200
  );

ALTER TABLE quote_requests
  ADD CONSTRAINT quote_requests_message_len_chk
  CHECK (
    message IS NULL
    OR char_length(btrim(message)) BETWEEN 20 AND 500
  );

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_status ON profiles(status);
CREATE INDEX idx_profiles_zone ON profiles(zone_id);
CREATE INDEX idx_jobs_zone ON jobs(zone_id);
CREATE INDEX idx_jobs_role_type ON jobs(role_type);
CREATE INDEX idx_jobs_active ON jobs(is_active) WHERE is_active = true;
CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_applications_worker ON applications(worker_id);
CREATE INDEX idx_documents_profile ON documents(profile_id);
CREATE INDEX idx_documents_ai_status ON documents(ai_status);
CREATE INDEX idx_documents_admin_status ON documents(admin_status);
CREATE INDEX idx_worker_profiles_role ON worker_profiles(worker_role);
CREATE INDEX idx_worker_profiles_available ON worker_profiles(is_actively_available) WHERE is_actively_available = true;

-- ============================================
-- ROW LEVEL SECURITY (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read their own profile; admins can read all
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Jobs: Anyone can read active jobs; restaurants can manage their own
CREATE POLICY "Anyone can view active jobs" ON jobs
  FOR SELECT USING (is_active = true);

CREATE POLICY "Restaurants can manage own jobs" ON jobs
  FOR ALL USING (
    restaurant_id IN (
      SELECT rp.id FROM restaurant_profiles rp
      JOIN profiles p ON p.id = rp.profile_id
      WHERE p.id = auth.uid()
    )
  );

-- ============================================
-- STORAGE BUCKETS & MISSING POLICIES
-- ============================================

-- Create the 'documents' Storage Bucket safely
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies for 'documents' bucket
CREATE POLICY "Public Read Access" ON storage.objects 
  FOR SELECT USING (bucket_id = 'documents');

CREATE POLICY "Auth Insert" ON storage.objects 
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Auth Update" ON storage.objects 
  FOR UPDATE TO authenticated USING (bucket_id = 'documents');

-- Missing Database INSERT policies
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their restaurant profile" ON restaurant_profiles
  FOR INSERT WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can insert their worker profile" ON worker_profiles
  FOR INSERT WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can insert their vendor profile" ON vendor_profiles
  FOR INSERT WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can insert their own documents" ON documents
  FOR INSERT WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can read own documents" ON documents
  FOR SELECT USING (profile_id = auth.uid());
