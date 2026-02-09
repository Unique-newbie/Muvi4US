-- Admin Features Schema Migration

-- 1. App Settings Table (Singleton)
CREATE TABLE IF NOT EXISTS public.app_settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    is_locked BOOLEAN DEFAULT false,
    lockdown_message TEXT,
    lockdown_until TIMESTAMPTZ,
    is_guest_lockdown BOOLEAN DEFAULT false,
    featured_content_id INTEGER,
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access (needed for lockdown checks)
CREATE POLICY "Public read settings" ON public.app_settings
    FOR SELECT USING (true);

-- Allow admins to update settings
CREATE POLICY "Admins can update settings" ON public.app_settings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
    );

-- Insert default row if not exists
INSERT INTO public.app_settings (id) VALUES (1) ON CONFLICT DO NOTHING;


-- 2. Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('info', 'warning', 'success', 'error')) DEFAULT 'info',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Allow public read active announcements
CREATE POLICY "Public read active announcements" ON public.announcements
    FOR SELECT USING (is_active = true);

-- Allow admins full access
CREATE POLICY "Admins full access announcements" ON public.announcements
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
    );


-- 3. Proxy Sources Table
CREATE TABLE IF NOT EXISTS public.proxy_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.proxy_sources ENABLE ROW LEVEL SECURITY;

-- Allow public read active proxy sources
CREATE POLICY "Public read active proxy sources" ON public.proxy_sources
    FOR SELECT USING (is_active = true);

-- Allow admins full access
CREATE POLICY "Admins full access proxy sources" ON public.proxy_sources
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
    );
