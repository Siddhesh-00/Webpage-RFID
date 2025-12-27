-- Insert sample students
INSERT INTO public.students (uid, name, department, year, roll_number, parent_contact) VALUES
('04A3B2C1', 'Alice Johnson', 'Computer Science', '2024', 'CS2024001', '+1234567890'),
('05C4D5E6', 'Bob Smith', 'Electrical Engineering', '2023', 'EE2023045', '+1234567891'),
('06F7G8H9', 'Carol Davis', 'Mechanical Engineering', '2024', 'ME2024012', '+1234567892'),
('07I8J9K0', 'David Wilson', 'Computer Science', '2022', 'CS2022087', '+1234567893'),
('08L1M2N3', 'Emma Brown', 'Civil Engineering', '2023', 'CE2023023', '+1234567894'),
('09O4P5Q6', 'Frank Miller', 'Computer Science', '2024', 'CS2024034', '+1234567895'),
('10R7S8T9', 'Grace Taylor', 'Electrical Engineering', '2024', 'EE2024018', '+1234567896'),
('11U0V1W2', 'Henry Anderson', 'Mechanical Engineering', '2023', 'ME2023056', '+1234567897'),
('12X3Y4Z5', 'Ivy Thomas', 'Computer Science', '2024', 'CS2024067', '+1234567898'),
('13A6B7C8', 'Jack Martin', 'Civil Engineering', '2022', 'CE2022041', '+1234567899')
ON CONFLICT (uid) DO NOTHING;

-- Insert sample ESP devices
INSERT INTO public.esp_devices (device_id, device_name, ip_address, status, cache_size, uptime_seconds) VALUES
('ESP8266-001', 'Main Entrance', '192.168.1.101', 'online', 45, 86400),
('ESP8266-002', 'Library Gate', '192.168.1.102', 'online', 32, 72000),
('ESP8266-003', 'Lab Building', '192.168.1.103', 'offline', 0, 0)
ON CONFLICT (device_id) DO NOTHING;

-- Insert sample attendance logs for today
INSERT INTO public.attendance_logs (uid, student_id, status, device_id, manual_entry)
SELECT 
  s.uid,
  s.id,
  'success',
  'ESP8266-001',
  false
FROM public.students s
WHERE s.uid IN ('04A3B2C1', '05C4D5E6', '06F7G8H9', '07I8J9K0', '08L1M2N3')
ON CONFLICT DO NOTHING;

-- Insert a duplicate attempt
INSERT INTO public.attendance_logs (uid, student_id, status, device_id, manual_entry)
SELECT 
  s.uid,
  s.id,
  'duplicate',
  'ESP8266-001',
  false
FROM public.students s
WHERE s.uid = '04A3B2C1'
ON CONFLICT DO NOTHING;

-- Insert an unknown UID attempt
INSERT INTO public.attendance_logs (uid, student_id, status, device_id, manual_entry)
VALUES ('99Z9Z9Z9', NULL, 'unknown', 'ESP8266-002', false)
ON CONFLICT DO NOTHING;
