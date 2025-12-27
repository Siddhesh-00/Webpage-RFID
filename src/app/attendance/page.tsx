"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../supabase/client";
import { redirect } from "next/navigation";
import { AttendanceLog } from "@/types/attendance";
import { toast } from "sonner";
import {
  Calendar,
  Download,
  RefreshCw,
  Clock,
  User,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowDownToLine,
  ArrowUpFromLine,
} from "lucide-react";
import { format, startOfDay, endOfDay, parseISO } from "date-fns";

export default function AttendancePage() {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<"timestamp" | "name">("timestamp");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const pageSize = 25;

  const supabase = createClient();

  useEffect(() => {
    checkAuth();
    fetchLogs();

    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchLogs, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedDate, autoRefresh]);

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/sign-in");
    }
  };

  const fetchLogs = async () => {
    try {
      const dateStart = startOfDay(parseISO(selectedDate)).toISOString();
      const dateEnd = endOfDay(parseISO(selectedDate)).toISOString();

      const { data, error } = await supabase
        .from("attendance_logs")
        .select(
          `
          *,
          student:students(*)
        `
        )
        .gte("timestamp", dateStart)
        .lte("timestamp", dateEnd)
        .order("timestamp", { ascending: false });

      if (error) throw error;
      setLogs(data || []);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast.error("Failed to fetch attendance logs");
      setIsLoading(false);
    }
  };

  const sortedLogs = [...logs].sort((a, b) => {
    if (sortField === "timestamp") {
      const comparison =
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      return sortDirection === "asc" ? comparison : -comparison;
    } else {
      const nameA = a.student?.name || "";
      const nameB = b.student?.name || "";
      const comparison = nameA.localeCompare(nameB);
      return sortDirection === "asc" ? comparison : -comparison;
    }
  });

  const paginatedLogs = sortedLogs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(sortedLogs.length / pageSize);

  const handleSort = (field: "timestamp" | "name") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleExport = () => {
    try {
      const headers = [
        "Date",
        "Time",
        "Student Name",
        "Roll No",
        "Branch",
        "Division",
        "Status",
        "Type (IN/OUT)",
      ];

      const rows = sortedLogs.map((log) => [
        format(new Date(log.timestamp), "dd/MM/yyyy"),
        format(new Date(log.timestamp), "hh:mm a"),
        log.student?.name || "Unknown",
        log.student?.roll_no || log.student?.roll_number || "-",
        log.student?.branch || log.student?.department || "-",
        log.student?.division || "-",
        log.status,
        log.type || "IN",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row.map((cell) => `"${cell}"`).join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendance-${selectedDate}.csv`;
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

  const getStatusConfig = (status: AttendanceLog["status"]) => {
    switch (status) {
      case "success":
      case "Present":
        return {
          icon: CheckCircle2,
          label: "Present",
          color: "text-primary",
          bgColor: "bg-primary/10",
        };
      case "duplicate":
        return {
          icon: AlertCircle,
          label: "Duplicate",
          color: "text-warning",
          bgColor: "bg-warning/10",
        };
      case "Late":
        return {
          icon: Clock,
          label: "Late",
          color: "text-warning",
          bgColor: "bg-warning/10",
        };
      case "unknown":
      default:
        return {
          icon: HelpCircle,
          label: "Unknown",
          color: "text-destructive",
          bgColor: "bg-destructive/10",
        };
    }
  };

  // Calculate stats
  const stats = {
    total: logs.length,
    present: logs.filter((l) => l.status === "success" || l.status === "Present")
      .length,
    late: logs.filter((l) => l.status === "Late").length,
    duplicate: logs.filter((l) => l.status === "duplicate").length,
    unknown: logs.filter((l) => l.status === "unknown").length,
    inCount: logs.filter((l) => l.type === "IN" || !l.type).length,
    outCount: logs.filter((l) => l.type === "OUT").length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen animated-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading attendance logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-gradient">
      <div className="noise-texture min-h-screen">
        {/* Header */}
        <header className="glassmorphic border-b border-border/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-['Space_Grotesk']">
                Attendance Logs
              </h1>
              <p className="text-sm text-muted-foreground">
                View and export daily attendance records
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/dashboard"
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to Dashboard
              </a>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <div className="glassmorphic rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Total Scans</p>
                <p className="text-2xl font-bold font-['Space_Grotesk'] text-primary">
                  {stats.total}
                </p>
              </div>
              <div className="glassmorphic rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Present</p>
                <p className="text-2xl font-bold font-['Space_Grotesk'] text-primary">
                  {stats.present}
                </p>
              </div>
              <div className="glassmorphic rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Late</p>
                <p className="text-2xl font-bold font-['Space_Grotesk'] text-warning">
                  {stats.late}
                </p>
              </div>
              <div className="glassmorphic rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Duplicates</p>
                <p className="text-2xl font-bold font-['Space_Grotesk'] text-warning">
                  {stats.duplicate}
                </p>
              </div>
              <div className="glassmorphic rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Unknown</p>
                <p className="text-2xl font-bold font-['Space_Grotesk'] text-destructive">
                  {stats.unknown}
                </p>
              </div>
              <div className="glassmorphic rounded-lg p-4">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <ArrowDownToLine className="w-3 h-3" /> IN
                </p>
                <p className="text-2xl font-bold font-['Space_Grotesk']">
                  {stats.inCount}
                </p>
              </div>
              <div className="glassmorphic rounded-lg p-4">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <ArrowUpFromLine className="w-3 h-3" /> OUT
                </p>
                <p className="text-2xl font-bold font-['Space_Grotesk']">
                  {stats.outCount}
                </p>
              </div>
            </div>

            {/* Filters and Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-['JetBrains_Mono']"
                  />
                </div>

                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                    autoRefresh
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  <RefreshCw
                    className={`w-4 h-4 ${autoRefresh ? "animate-spin" : ""}`}
                  />
                  {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
                </button>
              </div>

              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>

            {/* Attendance Table */}
            <div className="glassmorphic rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/30 border-b border-border/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider font-['Space_Grotesk'] w-28">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider font-['Space_Grotesk'] w-24">
                        <button
                          onClick={() => handleSort("timestamp")}
                          className="flex items-center gap-1 hover:text-primary transition-colors"
                        >
                          Time
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider font-['Space_Grotesk']">
                        <button
                          onClick={() => handleSort("name")}
                          className="flex items-center gap-1 hover:text-primary transition-colors"
                        >
                          Student Name
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider font-['Space_Grotesk'] w-28">
                        Roll No
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider font-['Space_Grotesk'] w-32">
                        Branch & Div
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider font-['Space_Grotesk'] w-24">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider font-['Space_Grotesk'] w-20">
                        Type
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {paginatedLogs.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-8 text-center text-muted-foreground"
                        >
                          No attendance records for {format(parseISO(selectedDate), "MMMM d, yyyy")}
                        </td>
                      </tr>
                    ) : (
                      paginatedLogs.map((log) => {
                        const statusConfig = getStatusConfig(log.status);
                        const StatusIcon = statusConfig.icon;

                        return (
                          <tr
                            key={log.id}
                            className="hover:bg-primary/5 transition-all"
                          >
                            <td className="px-4 py-3 text-sm font-['JetBrains_Mono']">
                              {format(new Date(log.timestamp), "dd/MM/yyyy")}
                            </td>
                            <td className="px-4 py-3 text-sm font-['JetBrains_Mono']">
                              {format(new Date(log.timestamp), "hh:mm a")}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">
                                  {log.student?.name || "Unknown Student"}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground font-['JetBrains_Mono']">
                                UID: {log.uid}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm font-['JetBrains_Mono']">
                              {log.student?.roll_no ||
                                log.student?.roll_number ||
                                "-"}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {log.student?.branch ||
                                log.student?.department ||
                                "-"}
                              {log.student?.division && ` / ${log.student.division}`}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}
                              >
                                <StatusIcon className="w-3 h-3" />
                                {statusConfig.label}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                                  log.type === "OUT"
                                    ? "bg-destructive/10 text-destructive"
                                    : "bg-primary/10 text-primary"
                                }`}
                              >
                                {log.type === "OUT" ? (
                                  <ArrowUpFromLine className="w-3 h-3" />
                                ) : (
                                  <ArrowDownToLine className="w-3 h-3" />
                                )}
                                {log.type || "IN"}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * pageSize + 1} to{" "}
                    {Math.min(currentPage * pageSize, sortedLogs.length)} of{" "}
                    {sortedLogs.length}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-['JetBrains_Mono']">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="p-2 rounded hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
