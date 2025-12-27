CREATE TABLE IF NOT EXISTS public.students (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    uid text UNIQUE NOT NULL,
    name text NOT NULL,
    department text,
    year text,
    roll_number text,
    parent_contact text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.attendance_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
    uid text NOT NULL,
    status text NOT NULL CHECK (status IN ('success', 'duplicate', 'unknown')),
    timestamp timestamp with time zone DEFAULT timezone('utc'::text, now()),
    device_id text,
    manual_entry boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.esp_devices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id text UNIQUE NOT NULL,
    device_name text,
    ip_address text,
    last_heartbeat timestamp with time zone DEFAULT timezone('utc'::text, now()),
    status text DEFAULT 'offline' CHECK (status IN ('online', 'offline')),
    cache_size integer DEFAULT 0,
    uptime_seconds integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_students_uid ON public.students(uid);
CREATE INDEX IF NOT EXISTS idx_attendance_logs_timestamp ON public.attendance_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_logs_student_id ON public.attendance_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_esp_devices_device_id ON public.esp_devices(device_id);

ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.esp_devices DISABLE ROW LEVEL SECURITY;
