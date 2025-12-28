-- Clear sample/mock data from tables
-- This will remove all sample data so only real scans appear

DELETE FROM public.attendance_logs;
DELETE FROM public.esp_devices;

-- Note: We're keeping students table as users may have added real students
-- If you want to clear students too, uncomment the line below:
-- DELETE FROM public.students;
