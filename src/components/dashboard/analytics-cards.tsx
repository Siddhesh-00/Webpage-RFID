"use client";

import { Activity, Users, AlertTriangle, Clock } from "lucide-react";
import { AttendanceStats } from "@/types/attendance";

interface AnalyticsCardsProps {
  stats: AttendanceStats;
}

export function AnalyticsCards({ stats }: AnalyticsCardsProps) {
  const cards = [
    {
      title: "Today's Attendance",
      value: stats.today_count,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Unique Scans",
      value: stats.unique_scans,
      icon: Activity,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Duplicate Attempts",
      value: stats.duplicate_attempts,
      icon: AlertTriangle,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Avg Response Time",
      value: `${stats.average_response_time}ms`,
      icon: Clock,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="glassmorphic relative overflow-hidden rounded-lg p-6 noise-texture"
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-['Manrope']">
                  {card.title}
                </p>
                <p className="text-3xl font-bold font-['Space_Grotesk']">
                  {card.value}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
