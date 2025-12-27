"use client";

import { ESPDevice } from "@/types/attendance";
import { Server, Clock, Database, Wifi, WifiOff } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useState } from "react";

interface SystemStatusBarProps {
  devices: ESPDevice[];
  lastSync: Date;
  cacheStatus: string;
  apiHealth: "healthy" | "degraded" | "down";
}

export function SystemStatusBar({
  devices,
  lastSync,
  cacheStatus,
  apiHealth,
}: SystemStatusBarProps) {
  const [selectedDevice, setSelectedDevice] = useState<ESPDevice | null>(null);

  const onlineDevices = devices.filter((d) => d.status === "online");

  const getApiHealthColor = () => {
    switch (apiHealth) {
      case "healthy":
        return "bg-primary text-primary-foreground";
      case "degraded":
        return "bg-warning text-foreground";
      case "down":
        return "bg-destructive text-destructive-foreground";
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <>
      <div className="glassmorphic border-b border-border/50 px-6 py-3">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium font-['Manrope']">
                ESP Devices:
              </span>
              <span className="text-sm font-['JetBrains_Mono']">
                {onlineDevices.length}/{devices.length}
              </span>
            </div>

            <div className="flex gap-2">
              {devices.slice(0, 3).map((device) => (
                <button
                  key={device.id}
                  onClick={() => setSelectedDevice(device)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all hover:scale-105 active:scale-95 ${
                    device.status === "online"
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {device.status === "online" ? (
                      <Wifi className="w-3 h-3" />
                    ) : (
                      <WifiOff className="w-3 h-3" />
                    )}
                    {device.device_name || device.device_id}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Last sync:</span>
              <span className="text-sm font-['JetBrains_Mono']">
                {formatDistanceToNow(lastSync, { addSuffix: true })}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Cache:</span>
              <span className="text-sm font-['JetBrains_Mono']">
                {cacheStatus}
              </span>
            </div>

            <div
              className={`px-3 py-1 rounded-full text-xs font-medium ${getApiHealthColor()}`}
            >
              API {apiHealth.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {selectedDevice && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedDevice(null)}
        >
          <div
            className="glassmorphic rounded-lg p-6 max-w-md w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold font-['Space_Grotesk']">
                Device Diagnostics
              </h3>
              <button
                onClick={() => setSelectedDevice(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Device ID</span>
                <span className="text-sm font-['JetBrains_Mono']">
                  {selectedDevice.device_id}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">IP Address</span>
                <span className="text-sm font-['JetBrains_Mono']">
                  {selectedDevice.ip_address || "N/A"}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Status</span>
                <span
                  className={`text-sm font-medium ${
                    selectedDevice.status === "online"
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {selectedDevice.status.toUpperCase()}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">
                  Last Heartbeat
                </span>
                <span className="text-sm font-['JetBrains_Mono']">
                  {format(
                    new Date(selectedDevice.last_heartbeat),
                    "MMM dd, HH:mm:ss"
                  )}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Uptime</span>
                <span className="text-sm font-['JetBrains_Mono']">
                  {formatUptime(selectedDevice.uptime_seconds)}
                </span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-sm text-muted-foreground">Cache Size</span>
                <span className="text-sm font-['JetBrains_Mono']">
                  {selectedDevice.cache_size} records
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
