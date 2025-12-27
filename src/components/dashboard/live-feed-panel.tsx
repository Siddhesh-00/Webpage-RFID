"use client";

import { AttendanceLog } from "@/types/attendance";
import { CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";
import { format } from "date-fns";
import { useEffect, useRef } from "react";

interface LiveFeedPanelProps {
  logs: AttendanceLog[];
}

export function LiveFeedPanel({ logs }: LiveFeedPanelProps) {
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = 0;
    }
  }, [logs]);

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
                className={`glassmorphic rounded-lg p-4 border ${config.borderColor} animate-slide-in-down`}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: "both",
                }}
              >
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
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${config.bgColor} ${config.color}`}
                      >
                        {config.label}
                      </span>
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
