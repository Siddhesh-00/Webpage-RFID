-- Enable RLS on all tables
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esp_devices ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow authenticated users to read students" ON public.students;
DROP POLICY IF EXISTS "Allow authenticated users to insert students" ON public.students;
DROP POLICY IF EXISTS "Allow authenticated users to update students" ON public.students;
DROP POLICY IF EXISTS "Allow authenticated users to delete students" ON public.students;
DROP POLICY IF EXISTS "Allow service role full access to students" ON public.students;

DROP POLICY IF EXISTS "Allow authenticated users to read attendance_logs" ON public.attendance_logs;
DROP POLICY IF EXISTS "Allow authenticated users to insert attendance_logs" ON public.attendance_logs;
DROP POLICY IF EXISTS "Allow service role full access to attendance_logs" ON public.attendance_logs;

DROP POLICY IF EXISTS "Allow authenticated users to read esp_devices" ON public.esp_devices;
DROP POLICY IF EXISTS "Allow service role full access to esp_devices" ON public.esp_devices;

-- Students table policies
CREATE POLICY "Allow authenticated users to read students" ON public.students
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert students" ON public.students
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update students" ON public.students
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete students" ON public.students
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow service role full access to students" ON public.students
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Attendance logs policies
CREATE POLICY "Allow authenticated users to read attendance_logs" ON public.attendance_logs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert attendance_logs" ON public.attendance_logs
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow service role full access to attendance_logs" ON public.attendance_logs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ESP devices policies
CREATE POLICY "Allow authenticated users to read esp_devices" ON public.esp_devices
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow service role full access to esp_devices" ON public.esp_devices
  FOR ALL TO service_role USING (true) WITH CHECK (true);
