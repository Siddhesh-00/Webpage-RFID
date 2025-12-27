-- Create devices table for ESP8266 authentication
CREATE TABLE IF NOT EXISTS public.devices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    device_name text NOT NULL,
    api_secret text UNIQUE NOT NULL,
    is_active boolean DEFAULT true,
    last_seen timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create index for fast lookup by api_secret
CREATE INDEX IF NOT EXISTS idx_devices_api_secret ON public.devices(api_secret);

-- Enable RLS
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow authenticated users to read devices" ON public.devices;
DROP POLICY IF EXISTS "Allow authenticated users to insert devices" ON public.devices;
DROP POLICY IF EXISTS "Allow authenticated users to update devices" ON public.devices;
DROP POLICY IF EXISTS "Allow authenticated users to delete devices" ON public.devices;
DROP POLICY IF EXISTS "Allow service role full access to devices" ON public.devices;

-- Create policies
CREATE POLICY "Allow authenticated users to read devices" ON public.devices
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert devices" ON public.devices
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update devices" ON public.devices
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete devices" ON public.devices
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow service role full access to devices" ON public.devices
  FOR ALL TO service_role USING (true) WITH CHECK (true);
