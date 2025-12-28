"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../supabase/client";
import { redirect } from "next/navigation";
import { SystemStatusBar } from "@/components/dashboard/system-status-bar";
import { AnalyticsCards } from "@/components/dashboard/analytics-cards";
import { LiveFeedPanel } from "@/components/dashboard/live-feed-panel";
import { StudentRegistryTable } from "@/components/dashboard/student-registry-table";
import { QuickActionsToolbar } from "@/components/dashboard/quick-actions-toolbar";
import { APIEndpointMonitor } from "@/components/dashboard/api-endpoint-monitor";
import { AddStudentModal } from "@/components/dashboard/add-student-modal";
import { ManualEntryModal } from "@/components/dashboard/manual-entry-modal";
import { BulkImportModal } from "@/components/dashboard/bulk-import-modal";
import {
  Student,
  AttendanceLog,
  ESPDevice,
  AttendanceStats,
} from "@/types/attendance";
import { toast } from "sonner";

export default function Dashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [devices, setDevices] = useState<ESPDevice[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    today_count: 0,
    unique_scans: 0,
    duplicate_attempts: 0,
    average_response_time: 0,
  });
  const [lastSync, setLastSync] = useState(new Date());
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    checkAuth();
    fetchData();
    
    // Set up real-time subscription for attendance logs
    const channel = supabase
      .channel('attendance-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'attendance_logs',
        },
        async (payload) => {
          console.log('New attendance log received:', payload);
          // Fetch the complete log with student data
          const { data: newLog, error } = await supabase
            .from('attendance_logs')
            .select(`
              *,
              student:students(*)
            `)
            .eq('id', payload.new.id)
            .single();
          
          if (!error && newLog) {
            setAttendanceLogs((prev) => [newLog, ...prev].slice(0, 50));
            // Update stats
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (new Date(newLog.timestamp) >= today) {
              setStats((prev) => ({
                ...prev,
                today_count: prev.today_count + 1,
                unique_scans: newLog.status === 'success' ? prev.unique_scans + 1 : prev.unique_scans,
                duplicate_attempts: newLog.status === 'duplicate' ? prev.duplicate_attempts + 1 : prev.duplicate_attempts,
              }));
            }
            toast.success(`Scan received: ${newLog.student?.name || 'Unknown'}`);
          }
        }
      )
      .subscribe();
    
    // Fallback polling every 10 seconds
    const interval = setInterval(() => {
      fetchData();
    }, 10000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/sign-in");
    }
  };

  const fetchData = async () => {
    try {
      // Fetch students
      const { data: studentsData, error: studentsError } = await supabase
        .from("students")
        .select("*")
        .order("name");

      if (studentsError) throw studentsError;
      setStudents(studentsData || []);

      // Fetch attendance logs with student details
      const { data: logsData, error: logsError } = await supabase
        .from("attendance_logs")
        .select(
          `
          *,
          student:students(*)
        `
        )
        .order("timestamp", { ascending: false })
        .limit(50);

      if (logsError) throw logsError;
      setAttendanceLogs(logsData || []);

      // Fetch real devices from the devices table
      const { data: devicesData, error: devicesError } = await supabase
        .from("devices")
        .select("*")
        .order("device_name");

      if (devicesError) throw devicesError;
      
      // Transform devices to ESPDevice format for SystemStatusBar
      const transformedDevices: ESPDevice[] = (devicesData || []).map((device) => {
        // Check if device was seen in the last 5 minutes to determine online status
        const lastSeen = device.last_seen ? new Date(device.last_seen) : null;
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const isOnline = lastSeen && lastSeen > fiveMinutesAgo;
        
        return {
          id: device.id,
          device_id: device.id,
          device_name: device.device_name,
          ip_address: null,
          last_heartbeat: device.last_seen || device.created_at,
          status: isOnline ? "online" : "offline",
          cache_size: 0,
          uptime_seconds: 0,
          created_at: device.created_at,
        };
      });
      
      setDevices(transformedDevices);

      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayLogs =
        logsData?.filter(
          (log) => new Date(log.timestamp) >= today
        ) || [];

      const uniqueUIDs = new Set(
        todayLogs.filter((log) => log.status === "success").map((log) => log.uid)
      );

      const duplicates = todayLogs.filter(
        (log) => log.status === "duplicate"
      ).length;

      setStats({
        today_count: todayLogs.length,
        unique_scans: uniqueUIDs.size,
        duplicate_attempts: duplicates,
        average_response_time: 0,
      });

      setLastSync(new Date());
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
      setIsLoading(false);
    }
  };

  const handleAddStudent = async (studentData: {
    uid: string;
    name: string;
    department: string;
    year: string;
    roll_number: string;
    parent_contact: string;
  }) => {
    try {
      const { error } = await supabase.from("students").insert([studentData]);

      if (error) throw error;

      toast.success("Student added successfully");
      fetchData();
    } catch (error: any) {
      console.error("Error adding student:", error);
      toast.error(error.message || "Failed to add student");
    }
  };

  const handleManualEntry = async (data: { uid: string; timestamp: string }) => {
    try {
      // Find student by UID
      const { data: student } = await supabase
        .from("students")
        .select("*")
        .eq("uid", data.uid)
        .single();

      // Get today's start (midnight) for the selected timestamp
      const selectedDate = new Date(data.timestamp);
      const dayStart = new Date(selectedDate);
      dayStart.setHours(0, 0, 0, 0);
      
      // Check last scan for this UID on the same day
      const { data: lastTodayLog } = await supabase
        .from("attendance_logs")
        .select("*")
        .eq("uid", data.uid)
        .gte("timestamp", dayStart.toISOString())
        .lt("timestamp", new Date(dayStart.getTime() + 24 * 60 * 60 * 1000).toISOString())
        .order("timestamp", { ascending: false })
        .limit(1)
        .single();

      // Determine IN or OUT
      let scanType: "IN" | "OUT" = "IN";
      let status = student ? "success" : "unknown";
      
      if (student) {
        if (!lastTodayLog || lastTodayLog.type === "OUT") {
          scanType = "IN";
          status = "success";
        } else {
          scanType = "OUT";
          status = "success";
        }
      }

      const { error } = await supabase.from("attendance_logs").insert([
        {
          uid: data.uid,
          student_id: student?.id || null,
          status,
          timestamp: data.timestamp,
          manual_entry: true,
          type: scanType,
        },
      ]);

      if (error) throw error;

      toast.success("Attendance logged successfully");
      fetchData();
    } catch (error: any) {
      console.error("Error logging attendance:", error);
      toast.error(error.message || "Failed to log attendance");
    }
  };

  const handleBulkImport = () => {
    setIsBulkImportOpen(true);
  };

  const handleBulkImportSubmit = async (students: any[]) => {
    try {
      const { error } = await supabase.from("students").insert(students);

      if (error) throw error;

      toast.success(`Successfully imported ${students.length} students`);
      fetchData();
    } catch (error: any) {
      console.error("Error importing students:", error);
      toast.error(error.message || "Failed to import students");
    }
  };

  const handleExportReport = () => {
    try {
      // Prepare CSV data
      const headers = [
        "Timestamp",
        "UID",
        "Student Name",
        "Status",
        "Device ID",
        "Manual Entry",
      ];
      const rows = attendanceLogs.map((log) => [
        log.timestamp,
        log.uid,
        log.student?.name || "Unknown",
        log.status,
        log.device_id || "-",
        log.manual_entry ? "Yes" : "No",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");

      // Create download
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendance-report-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Report exported successfully");
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error("Failed to export report");
    }
  };

  const handleClearCache = () => {
    if (confirm("Are you sure you want to clear the cache?")) {
      toast.success("Cache cleared successfully");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen animated-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-gradient relative">
      <div className="noise-texture min-h-screen">
        {/* System Status Bar */}
        <SystemStatusBar
          devices={devices}
          lastSync={lastSync}
          cacheStatus="Active"
          apiHealth="healthy"
        />

        {/* Main Content */}
        <div className="flex h-[calc(100vh-60px)]">
          {/* Left Sidebar */}
          <aside className="w-60 glassmorphic border-r border-border/50 p-6 overflow-y-auto">
            <h2 className="text-lg font-bold font-['Space_Grotesk'] mb-6">
              RFID Attendance
            </h2>
            <nav className="space-y-2">
              <a
                href="/dashboard"
                className="block px-4 py-2 rounded-lg bg-primary/20 text-primary border border-primary/30 font-medium text-sm"
              >
                Dashboard
              </a>
              <a
                href="/students"
                className="block px-4 py-2 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-all text-sm"
              >
                Student Registry
              </a>
              <a
                href="/attendance"
                className="block px-4 py-2 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-all text-sm"
              >
                Attendance Logs
              </a>
              <a
                href="/devices"
                className="block px-4 py-2 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-all text-sm"
              >
                Device Management
              </a>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold font-['Space_Grotesk'] mb-2">
                  Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Real-time attendance monitoring and management
                </p>
              </div>

              {/* Analytics Cards */}
              <AnalyticsCards stats={stats} />

              {/* Quick Actions */}
              <QuickActionsToolbar
                onBulkImport={handleBulkImport}
                onAddStudent={() => setIsAddStudentOpen(true)}
                onExportReport={handleExportReport}
                onClearCache={handleClearCache}
                onManualEntry={() => setIsManualEntryOpen(true)}
              />

              {/* API Monitor */}
              <APIEndpointMonitor
                endpoints={[
                  {
                    name: "/api/data",
                    method: "GET",
                    latency: stats.average_response_time,
                    status: "healthy",
                  },
                  {
                    name: "/api/data",
                    method: "POST",
                    latency: stats.average_response_time + 50,
                    status: "healthy",
                  },
                ]}
              />

              {/* Student Registry */}
              <div>
                <h2 className="text-xl font-bold font-['Space_Grotesk'] mb-4">
                  Student Registry
                </h2>
                <StudentRegistryTable students={students} />
              </div>
            </div>
          </main>

          {/* Live Feed Right Rail */}
          <aside className="w-96 glassmorphic border-l border-border/50">
            <LiveFeedPanel logs={attendanceLogs} onLogsUpdate={fetchData} />
          </aside>
        </div>

        {/* Modals */}
        <AddStudentModal
          isOpen={isAddStudentOpen}
          onClose={() => setIsAddStudentOpen(false)}
          onSubmit={handleAddStudent}
        />
        <ManualEntryModal
          isOpen={isManualEntryOpen}
          onClose={() => setIsManualEntryOpen(false)}
          onSubmit={handleManualEntry}
        />
        <BulkImportModal
          isOpen={isBulkImportOpen}
          onClose={() => setIsBulkImportOpen(false)}
          onSubmit={handleBulkImportSubmit}
        />
      </div>
    </div>
  );
}
