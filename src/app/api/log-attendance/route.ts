import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-device-secret",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    // 1. Device Authentication
    const deviceSecret = request.headers.get("x-device-secret");
    if (!deviceSecret) {
      return NextResponse.json(
        { status: "error", message: "Missing Device Secret" },
        { status: 401, headers: corsHeaders }
      );
    }

    const { data: device, error: deviceError } = await supabase
      .from("devices")
      .select("*")
      .eq("api_secret", deviceSecret)
      .eq("is_active", true)
      .single();

    if (deviceError || !device) {
      return NextResponse.json(
        { status: "error", message: "Invalid Device Secret" },
        { status: 401, headers: corsHeaders }
      );
    }

    // Update Last Seen
    await supabase
      .from("devices")
      .update({ last_seen: new Date().toISOString() })
      .eq("id", device.id);

    // 2. Parse Request
    const body = await request.json();
    const { uid, device_id, type = "IN" } = body;

    if (!uid) {
      return NextResponse.json(
        { status: "error", message: "UID is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // 3. Find Student
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("*")
      .eq("uid", uid)
      .single();

    if (studentError && studentError.code !== "PGRST116") throw studentError;

    // 4. Check for Duplicate Scans (Last 5 mins)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: recentLog } = await supabase
      .from("attendance_logs")
      .select("*")
      .eq("uid", uid)
      .gte("timestamp", fiveMinutesAgo)
      .order("timestamp", { ascending: false })
      .limit(1)
      .single();

    // 5. Determine Status (FIXED TYPE DEFINITION HERE)
    let status: "success" | "duplicate" | "unknown" | "Present" | "Late";
    let message: string;

    if (!student) {
      status = "unknown";
      message = "Unknown Card";
    } else if (recentLog) {
      status = "duplicate";
      message = `Duplicate scan for ${student.name}`;
    } else {
      // Calculate Late Status (e.g., after 9:00 AM)
      const now = new Date();
      const hours = now.getHours();
      const isLate = hours >= 9 && now.getMinutes() > 0; // Simple logic: 9:01+ is late

      status = isLate && type === "IN" ? "Late" : "Present";
      message = `Marked ${status} for ${student.name}`;
    }

    // 6. Insert Log (Normalize status for Database)
    // The database likely only accepts "success", so we convert "Present/Late" -> "success"
    const dbStatus = (status === "Present" || status === "Late") ? "success" : status;

    const { error: logError } = await supabase.from("attendance_logs").insert([
      {
        uid,
        student_id: student?.id || null,
        status: dbStatus, // Use the normalized status for DB
        device_id: device_id || device.device_name || null,
        manual_entry: false,
        type: type || "IN",
      },
    ]);

    if (logError) throw logError;

    // 7. Return Response (Include parent_phone for SMS!)
    return NextResponse.json(
      {
        status: status === "unknown" ? "error" : "success",
        student_name: student?.name || null,
        student_roll_no: student?.roll_no || null,
        student_branch: student?.branch || null,
        
        // IMPORTANT: ESP8266 needs this for SMS
        parent_phone: student?.parent_phone || student?.parent_number || "", 
        
        attendance_status: status, // "Present", "Late", "duplicate"
        message,
        timestamp: new Date().toISOString(),
      },
      { headers: corsHeaders }
    );

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

// GET endpoint (Keep this as is for caching)
export async function GET(request: NextRequest) {
  // ... existing GET code ...
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
  const { data } = await supabase.from("students").select("*");
  return NextResponse.json({ data }, { headers: corsHeaders });
}
