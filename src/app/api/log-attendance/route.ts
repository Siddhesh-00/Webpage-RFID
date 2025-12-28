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

    // Check for device authentication
    const deviceSecret = request.headers.get("x-device-secret");

    if (!deviceSecret) {
      return NextResponse.json(
        {
          status: "error",
          message: "Missing x-device-secret header. Device authentication required.",
        },
        { status: 401, headers: corsHeaders }
      );
    }

    // Verify the device secret
    const { data: device, error: deviceError } = await supabase
      .from("devices")
      .select("*")
      .eq("api_secret", deviceSecret)
      .eq("is_active", true)
      .single();

    if (deviceError || !device) {
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid or inactive device secret. Authentication failed.",
        },
        { status: 401, headers: corsHeaders }
      );
    }

    // Update last_seen for the device
    await supabase
      .from("devices")
      .update({ last_seen: new Date().toISOString() })
      .eq("id", device.id);

    const body = await request.json();
    const { uid, device_id, type = "IN" } = body;

    if (!uid) {
      return NextResponse.json(
        {
          status: "error",
          message: "UID is required",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Look up the student by UID
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("*")
      .eq("uid", uid)
      .single();

    if (studentError && studentError.code !== "PGRST116") {
      throw studentError;
    }

    // Get today's start (midnight)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    // Check last scan today
    const { data: lastTodayLog } = await supabase
      .from("attendance_logs")
      .select("*")
      .eq("uid", uid)
      .gte("timestamp", todayStart.toISOString())
      .order("timestamp", { ascending: false })
      .limit(1)
      .single();

    // Check for duplicate scan in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const isDuplicateRecent = lastTodayLog && new Date(lastTodayLog.timestamp) > new Date(fiveMinutesAgo);

    // Determine status and scan type (IN/OUT)
    let status: "success" | "duplicate" | "unknown" | "Present" | "Late";
    let message: string;
    let scanType: "IN" | "OUT" = "IN";

    if (!student) {
      status = "unknown";
      message = "Unknown Card - UID not registered";
    } else if (isDuplicateRecent) {
      status = "duplicate";
      message = `Duplicate scan - ${student.name} already scanned at ${new Date(lastTodayLog.timestamp).toLocaleTimeString()}`;
      scanType = lastTodayLog.type || "IN";
    } else {
      // Determine IN or OUT based on last scan today
      // First successful scan = IN with Present status
      // Second successful scan = OUT with success status
      if (!lastTodayLog || lastTodayLog.type === "OUT") {
        scanType = "IN";
        status = "Present";
        message = `${student.name} - ${scanType} (${status})`;
      } else {
        // Previous scan was IN, now it's OUT
        scanType = "OUT";
        status = "success";
        message = `${student.name} - ${scanType}`;
      }
    }

    // Insert attendance log
    const { error: logError } = await supabase.from("attendance_logs").insert([
      {
        uid,
        student_id: student?.id || null,
        status: status === "Present" || status === "Late" ? "success" : status,
        device_id: device_id || device.device_name || null,
        manual_entry: false,
        type: scanType,
      },
    ]);

    if (logError) throw logError;

    const latency = Date.now() - startTime;

    // Success response with student info
    return NextResponse.json(
      {
        status: status === "unknown" ? "error" : "success",
        student_name: student?.name || null,
        student_roll_no: student?.roll_no || student?.roll_number || null,
        student_branch: student?.branch || student?.department || null,
        student_division: student?.division || null,
        parent_phone: student?.parent_contact || null,
        attendance_status: status,
        message,
        scan_type: scanType,
        latency,
        timestamp: new Date().toISOString(),
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("Error logging attendance:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to log attendance",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

// GET endpoint to fetch student data for ESP8266 cache
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    // Fetch all students for ESP8266 local cache
    const { data: students, error } = await supabase
      .from("students")
      .select("uid, name, roll_no, branch, division")
      .order("name");

    if (error) throw error;

    const latency = Date.now() - startTime;

    return NextResponse.json(
      {
        status: "success",
        data: students,
        count: students?.length || 0,
        latency,
        timestamp: new Date().toISOString(),
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to fetch students",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
