"use client";

import { Activity } from "lucide-react";

interface APIEndpointMonitorProps {
  endpoints: {
    name: string;
    method: "GET" | "POST";
    latency: number;
    status: "healthy" | "warning" | "error";
  }[];
}

export function APIEndpointMonitor({ endpoints }: APIEndpointMonitorProps) {
  const getStatusColor = (status: string, latency: number) => {
    if (status === "error") return "bg-destructive";
    if (latency > 1000) return "bg-destructive";
    if (latency > 500) return "bg-warning";
    return "bg-primary";
  };

  const getStatusLabel = (latency: number) => {
    if (latency > 1000) return "Slow";
    if (latency > 500) return "Medium";
    return "Fast";
  };

  return (
    <div className="glassmorphic rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-bold font-['Space_Grotesk']">
          API Endpoint Monitor
        </h3>
      </div>

      <div className="space-y-4">
        {endpoints.map((endpoint, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium font-['JetBrains_Mono'] ${
                    endpoint.method === "GET"
                      ? "bg-primary/20 text-primary"
                      : "bg-warning/20 text-warning"
                  }`}
                >
                  {endpoint.method}
                </span>
                <span className="text-sm font-['JetBrains_Mono']">
                  {endpoint.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-['JetBrains_Mono'] text-muted-foreground">
                  {endpoint.latency}ms
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    endpoint.latency > 1000
                      ? "bg-destructive/20 text-destructive"
                      : endpoint.latency > 500
                      ? "bg-warning/20 text-warning"
                      : "bg-primary/20 text-primary"
                  }`}
                >
                  {getStatusLabel(endpoint.latency)}
                </span>
              </div>
            </div>
            <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${getStatusColor(
                  endpoint.status,
                  endpoint.latency
                )}`}
                style={{
                  width: `${Math.min((endpoint.latency / 2000) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
