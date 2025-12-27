-- Add new columns to students table
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS roll_no text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS branch text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS division text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS college_year text;

-- Update existing department column to branch if needed
UPDATE public.students SET branch = department WHERE branch IS NULL AND department IS NOT NULL;
UPDATE public.students SET roll_no = roll_number WHERE roll_no IS NULL AND roll_number IS NOT NULL;
UPDATE public.students SET college_year = year WHERE college_year IS NULL AND year IS NOT NULL;

-- Add type column to attendance_logs for IN/OUT tracking
ALTER TABLE public.attendance_logs ADD COLUMN IF NOT EXISTS type text DEFAULT 'IN' CHECK (type IN ('IN', 'OUT'));

-- Update status constraint to include Present/Late
ALTER TABLE public.attendance_logs DROP CONSTRAINT IF EXISTS attendance_logs_status_check;
ALTER TABLE public.attendance_logs ADD CONSTRAINT attendance_logs_status_check CHECK (status IN ('success', 'duplicate', 'unknown', 'Present', 'Late'));

-- Note: Date filtering will use timestamp range queries instead of function-based index
