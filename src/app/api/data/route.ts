import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    // Fetch all students
    const { data: students, error } = await supabase
      .from("students")
      .select("*")
      .order("name");

    if (error) throw error;

    const latency = Date.now() - startTime;

    return NextResponse.json(
      {
        success: true,
        data: students,
        latency,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch data",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
    const body = await request.json();

    const { uid, device_id } = body;

    if (!uid) {
      return NextResponse.json(
        { success: false, error: "UID is required" },
        { status: 400 }
      );
    }

    // Find student by UID
    const { data: student } = await supabase
      .from("students")
      .select("*")
      .eq("uid", uid)
      .single();

    // Check for duplicate scan in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: recentLog } = await supabase
      .from("attendance_logs")
      .select("*")
      .eq("uid", uid)
      .gte("timestamp", fiveMinutesAgo)
      .single();

    let status: "success" | "duplicate" | "unknown";

    if (recentLog) {
      status = "duplicate";
    } else if (!student) {
      status = "unknown";
    } else {
      status = "success";
    }

    // Insert attendance log
    const { error: logError } = await supabase.from("attendance_logs").insert([
      {
        uid,
        student_id: student?.id || null,
        status,
        device_id: device_id || null,
        manual_entry: false,
      },
    ]);

    if (logError) throw logError;

    const latency = Date.now() - startTime;

    return NextResponse.json(
      {
        success: true,
        data: {
          status,
          student: student || null,
          message:
            status === "success"
              ? "Attendance recorded successfully"
              : status === "duplicate"
              ? "Duplicate scan detected"
              : "Unknown UID",
        },
        latency,
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
        error: error.message || "Failed to process attendance",
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
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    }
  );
}
