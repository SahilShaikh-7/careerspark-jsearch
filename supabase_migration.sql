-- Run this in the Supabase SQL Editor

-- 1. Update Profiles Table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 2. Create Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    payment_id TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Matched Jobs Table
CREATE TABLE IF NOT EXISTS public.matched_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    match_percentage NUMERIC,
    apply_url TEXT,
    description TEXT,
    salary_range TEXT,
    experience_required TEXT,
    job_type TEXT,
    application_status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set Admin User Manually (Optional - code does it automatically too)
-- UPDATE public.profiles SET is_admin = true, subscription_tier = 'pro' WHERE id = (SELECT id FROM auth.users WHERE email = 'sahil68shaikh68@gmail.com');
