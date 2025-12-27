import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
    const body = await request.json();

    const { device_id, device_name, ip_address, cache_size, uptime_seconds } =
      body;

    if (!device_id) {
      return NextResponse.json(
        { success: false, error: "Device ID is required" },
        { status: 400 }
      );
    }

    // Upsert device info
    const { error } = await supabase
      .from("esp_devices")
      .upsert(
        {
          device_id,
          device_name: device_name || null,
          ip_address: ip_address || null,
          cache_size: cache_size || 0,
          uptime_seconds: uptime_seconds || 0,
          status: "online",
          last_heartbeat: new Date().toISOString(),
        },
        {
          onConflict: "device_id",
        }
      );

    if (error) throw error;

    return NextResponse.json(
      {
        success: true,
        message: "Heartbeat received",
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process heartbeat",
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    }
  );
}
