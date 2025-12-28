"use client";

import { AttendanceLog } from "@/types/attendance";
import { CheckCircle2, AlertCircle, HelpCircle, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface LiveFeedPanelProps {
  logs: AttendanceLog[];
  onLogsUpdate: () => void;
}

export function LiveFeedPanel({ logs, onLogsUpdate }: LiveFeedPanelProps) {
  const feedRef = useRef<HTMLDivElement>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = 0;
    }
  }, [logs]);

  const handleDelete = async (logId: string) => {
    if (!confirm("Are you sure you want to delete this attendance log?")) {
      return;
    }

    setDeletingId(logId);
    try {
      const { error } = await supabase
        .from("attendance_logs")
        .delete()
        .eq("id", logId);

      if (error) throw error;

      toast.success("Attendance log deleted successfully");
      onLogsUpdate();
    } catch (error: any) {
      toast.error("Failed to delete log: " + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusConfig = (status: AttendanceLog["status"]) => {
    switch (status) {
      case "success":
        return {
          icon: CheckCircle2,
          label: "Success",
          color: "text-primary",
          bgColor: "bg-primary/10",
          borderColor: "border-primary/30",
        };
      case "duplicate":
        return {
          icon: AlertCircle,
          label: "Duplicate",
          color: "text-warning",
          bgColor: "bg-warning/10",
          borderColor: "border-warning/30",
        };
      case "unknown":
        return {
          icon: HelpCircle,
          label: "Unknown UID",
          color: "text-destructive",
          bgColor: "bg-destructive/10",
          borderColor: "border-destructive/30",
        };
      default:
        return {
          icon: HelpCircle,
          label: "Unknown",
          color: "text-muted-foreground",
          bgColor: "bg-muted/10",
          borderColor: "border-muted/30",
        };
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 border-b border-border/50">
        <h2 className="text-xl font-bold font-['Space_Grotesk']">Live Feed</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time attendance logs
        </p>
      </div>
      <div
        ref={feedRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin"
      >
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">
              No attendance logs yet
            </p>
          </div>
        ) : (
          logs.map((log, index) => {
            const config = getStatusConfig(log.status);
            const Icon = config.icon;

            return (
              <div
                key={log.id}
                className={`glassmorphic rounded-lg p-4 border ${config.borderColor} animate-slide-in-down group relative`}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: "both",
                }}
              >
                <button
                  onClick={() => handleDelete(log.id)}
                  disabled={deletingId === log.id}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-destructive/20 rounded-lg disabled:opacity-50"
                  title="Delete log"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${config.bgColor} mt-0.5`}>
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-semibold text-sm truncate">
                          {log.student?.name || "Unknown Student"}
                        </p>
                        <p
                          className="text-xs text-muted-foreground font-['JetBrains_Mono'] mt-0.5"
                        >
                          UID: {log.uid}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {log.type && (
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            log.type === "IN" 
                              ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                              : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                          }`}>
                            {log.type}
                          </span>
                        )}
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${config.bgColor} ${config.color}`}
                        >
                          {config.label}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="font-['JetBrains_Mono']">
                        {format(new Date(log.timestamp), "HH:mm:ss")}
                      </span>
                      {log.device_id && (
                        <span className="truncate">
                          Device: {log.device_id}
                        </span>
                      )}
                      {log.manual_entry && (
                        <span className="text-primary">Manual</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
