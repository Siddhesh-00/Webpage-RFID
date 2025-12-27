export interface Student {
  id: string;
  uid: string;
  name: string;
  department: string | null;
  year: string | null;
  roll_number: string | null;
  roll_no: string | null;
  branch: string | null;
  division: string | null;
  college_year: string | null;
  parent_contact: string | null;
  created_at: string;
  updated_at: string;
}

export interface AttendanceLog {
  id: string;
  student_id: string | null;
  uid: string;
  status: 'success' | 'duplicate' | 'unknown' | 'Present' | 'Late';
  timestamp: string;
  device_id: string | null;
  manual_entry: boolean;
  type: 'IN' | 'OUT' | null;
  student?: Student;
}

export interface ESPDevice {
  id: string;
  device_id: string;
  device_name: string | null;
  ip_address: string | null;
  last_heartbeat: string;
  status: 'online' | 'offline';
  cache_size: number;
  uptime_seconds: number;
  created_at: string;
}

export interface AttendanceStats {
  today_count: number;
  unique_scans: number;
  duplicate_attempts: number;
  average_response_time: number;
}

export interface Device {
  id: string;
  device_name: string;
  api_secret: string;
  is_active: boolean;
  last_seen: string | null;
  created_at: string;
}
