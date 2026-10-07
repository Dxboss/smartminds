-- Migration: 0001_leads_table.sql
-- Smartminds Training College: Leads & Enquiries Table (PRD Section 14)

CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('free_advice', 'funded_eligibility', 'private_tutoring', 'general_contact')),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    course_interest TEXT,
    message TEXT,
    extra_data JSONB DEFAULT '{}'::jsonb,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_term TEXT,
    utm_content TEXT,
    source_page TEXT NOT NULL,
    consent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'enrolled', 'lost')),
    assigned_to UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexing for pipeline management and attribution analytics
CREATE INDEX IF NOT EXISTS idx_leads_type ON public.leads (type);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads (status);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads (email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_utm_source ON public.leads (utm_source);

-- Enable Row Level Security (PRD Section 13 & 17: Deny by default)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Policy 1: Service role has full access
CREATE POLICY "Service role full access on leads"
    ON public.leads
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Policy 2: Public anonymous users can insert leads (with consent)
CREATE POLICY "Public anonymous can insert leads"
    ON public.leads
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (consent_at IS NOT NULL);

-- Policy 3: Owner admin and administrative staff can view and manage leads
-- (In Phase 1b, linked to role_permissions)
CREATE POLICY "Admin staff can view leads"
    ON public.leads
    FOR SELECT
    TO authenticated
    USING (
        auth.jwt() ->> 'role' IN ('owner_admin', 'super_admin', 'administrative_staff')
    );
