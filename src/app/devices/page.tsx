"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../supabase/client";
import { redirect } from "next/navigation";
import { Device } from "@/types/attendance";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Copy,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Shield,
  Cpu,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";

function generateApiSecret(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let secret = "sk_live_";
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState("");
  const [newlyCreatedDevice, setNewlyCreatedDevice] = useState<Device | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    checkAuth();
    fetchDevices();
  }, []);

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/sign-in");
    }
  };

  const fetchDevices = async () => {
    try {
      const { data, error } = await supabase
        .from("devices")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDevices(data || []);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching devices:", error);
      toast.error("Failed to fetch devices");
      setIsLoading(false);
    }
  };

  const handleAddDevice = async () => {
    if (!newDeviceName.trim()) {
      toast.error("Device name is required");
      return;
    }

    try {
      const apiSecret = generateApiSecret();

      const { data, error } = await supabase
        .from("devices")
        .insert([
          {
            device_name: newDeviceName,
            api_secret: apiSecret,
            is_active: true,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setNewlyCreatedDevice(data);
      setNewDeviceName("");
      toast.success("Device created successfully");
      fetchDevices();
    } catch (error: any) {
      console.error("Error adding device:", error);
      toast.error(error.message || "Failed to add device");
    }
  };

  const handleToggleActive = async (device: Device) => {
    try {
      const { error } = await supabase
        .from("devices")
        .update({ is_active: !device.is_active })
        .eq("id", device.id);

      if (error) throw error;

      toast.success(
        device.is_active ? "Device deactivated" : "Device activated"
      );
      fetchDevices();
    } catch (error: any) {
      console.error("Error toggling device:", error);
      toast.error(error.message || "Failed to update device");
    }
  };

  const handleDelete = async (device: Device) => {
    if (
      !confirm(
        `Are you sure you want to delete "${device.device_name}"? This will invalidate the API key.`
      )
    )
      return;

    try {
      const { error } = await supabase
        .from("devices")
        .delete()
        .eq("id", device.id);

      if (error) throw error;

      toast.success("Device deleted successfully");
      fetchDevices();
    } catch (error: any) {
      console.error("Error deleting device:", error);
      toast.error(error.message || "Failed to delete device");
    }
  };

  const handleCopySecret = (secret: string, id: string) => {
    navigator.clipboard.writeText(secret);
    setCopiedId(id);
    toast.success("API secret copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleShowSecret = (id: string) => {
    setShowSecrets((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const maskSecret = (secret: string) => {
    return secret.substring(0, 10) + "•".repeat(20) + secret.substring(secret.length - 4);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen animated-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading devices...</p>
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
              <h1 className="text-2xl font-bold font-['Space_Grotesk'] flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                Device Management
              </h1>
              <p className="text-sm text-muted-foreground">
                Generate and manage API keys for your ESP8266 RFID scanners
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/dashboard"
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to Dashboard
              </a>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Add New Device
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Info Card */}
            <div className="glassmorphic rounded-lg p-6 border-l-4 border-primary">
              <h3 className="font-bold font-['Space_Grotesk'] mb-2">
                How Device Authentication Works
              </h3>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>
                  Click "Add New Device" to generate a unique API secret key
                </li>
                <li>
                  Copy the secret key and add it to your ESP8266 Arduino code
                </li>
                <li>
                  Your ESP8266 sends the key in the{" "}
                  <code className="px-1 py-0.5 bg-muted rounded font-['JetBrains_Mono'] text-xs">
                    x-device-secret
                  </code>{" "}
                  header
                </li>
                <li>
                  The server validates the key before accepting attendance logs
                </li>
              </ol>
            </div>

            {/* Arduino Code Example */}
            <div className="glassmorphic rounded-lg p-6">
              <h3 className="font-bold font-['Space_Grotesk'] mb-4 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-primary" />
                ESP8266 Code Example
              </h3>
              <pre className="bg-muted/50 rounded-lg p-4 overflow-x-auto text-xs font-['JetBrains_Mono']">
{`// Add your API secret from the device list below
const String DEVICE_SECRET = "sk_live_your_secret_here";

void sendToWebpage(String uid) {
  if (WiFi.status() == WL_CONNECTED) {
    std::unique_ptr<BearSSL::WiFiClientSecure> client(new BearSSL::WiFiClientSecure);
    client->setInsecure();
    
    HTTPClient http;
    http.begin(*client, "https://ca3f638c-aef4-441d-8ce7-7eecd2daba00.canvases.tempo.build/api/log-attendance");
    
    // IMPORTANT: Add these headers
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-device-secret", DEVICE_SECRET);
    
    String jsonPayload = "{\\"uid\\":\\"" + uid + "\\"}";
    int httpResponseCode = http.POST(jsonPayload);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println(response);
    }
    http.end();
  }
}`}
              </pre>
            </div>

            {/* Devices List */}
            <div className="glassmorphic rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-border/50">
                <h3 className="font-bold font-['Space_Grotesk']">
                  Registered Devices ({devices.length})
                </h3>
              </div>

              {devices.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Cpu className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No devices registered yet.</p>
                  <p className="text-sm">
                    Click "Add New Device" to create your first API key.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {devices.map((device) => (
                    <div
                      key={device.id}
                      className="p-4 hover:bg-primary/5 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Cpu className="w-4 h-4 text-primary" />
                            <span className="font-medium">
                              {device.device_name}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${
                                device.is_active
                                  ? "bg-primary/20 text-primary"
                                  : "bg-destructive/20 text-destructive"
                              }`}
                            >
                              {device.is_active ? "Active" : "Inactive"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex-1 px-3 py-2 bg-muted/50 rounded font-['JetBrains_Mono'] text-sm">
                              {showSecrets[device.id]
                                ? device.api_secret
                                : maskSecret(device.api_secret)}
                            </div>
                            <button
                              onClick={() => toggleShowSecret(device.id)}
                              className="p-2 hover:bg-primary/10 rounded transition-colors"
                              title={showSecrets[device.id] ? "Hide" : "Show"}
                            >
                              {showSecrets[device.id] ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() =>
                                handleCopySecret(device.api_secret, device.id)
                              }
                              className="p-2 hover:bg-primary/10 rounded transition-colors"
                              title="Copy"
                            >
                              {copiedId === device.id ? (
                                <CheckCircle2 className="w-4 h-4 text-primary" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>

                          <div className="text-xs text-muted-foreground space-x-4">
                            <span>
                              Created:{" "}
                              {format(
                                new Date(device.created_at),
                                "MMM d, yyyy HH:mm"
                              )}
                            </span>
                            {device.last_seen && (
                              <span>
                                Last seen:{" "}
                                {format(
                                  new Date(device.last_seen),
                                  "MMM d, yyyy HH:mm"
                                )}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleActive(device)}
                            className={`p-2 rounded transition-colors ${
                              device.is_active
                                ? "hover:bg-warning/20 text-warning"
                                : "hover:bg-primary/20 text-primary"
                            }`}
                            title={
                              device.is_active ? "Deactivate" : "Activate"
                            }
                          >
                            {device.is_active ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(device)}
                            className="p-2 hover:bg-destructive/20 text-destructive rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Add Device Modal */}
        {isAddModalOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setIsAddModalOpen(false);
              setNewlyCreatedDevice(null);
            }}
          >
            <div
              className="glassmorphic rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {newlyCreatedDevice ? (
                <>
                  <div className="text-center mb-6">
                    <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-bold font-['Space_Grotesk']">
                      Device Created!
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Copy the API secret below. You won't be able to see the
                      full key again.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Device Name
                      </label>
                      <div className="px-3 py-2 bg-muted/50 rounded-lg">
                        {newlyCreatedDevice.device_name}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        API Secret{" "}
                        <span className="text-destructive">(Copy Now!)</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 px-3 py-2 bg-primary/10 border border-primary/30 rounded-lg font-['JetBrains_Mono'] text-sm break-all">
                          {newlyCreatedDevice.api_secret}
                        </div>
                        <button
                          onClick={() =>
                            handleCopySecret(
                              newlyCreatedDevice.api_secret,
                              newlyCreatedDevice.id
                            )
                          }
                          className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all"
                        >
                          {copiedId === newlyCreatedDevice.id ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <Copy className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setNewlyCreatedDevice(null);
                    }}
                    className="w-full mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all"
                  >
                    Done
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold font-['Space_Grotesk'] mb-6">
                    Add New Device
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Device Name <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        value={newDeviceName}
                        onChange={(e) => setNewDeviceName(e.target.value)}
                        className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        placeholder="e.g., Main Gate Scanner, Library Entrance"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-4 py-2 rounded-lg font-medium text-sm bg-secondary hover:bg-secondary/80 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddDevice}
                      className="px-4 py-2 rounded-lg font-medium text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
                    >
                      Generate API Key
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
