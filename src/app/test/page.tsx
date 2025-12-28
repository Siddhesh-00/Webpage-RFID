'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TestPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [status, setStatus] = useState('Loading...');
  const [apiSecret, setApiSecret] = useState('');

  useEffect(() => {
    checkDevices();
    fetchLogs();
    subscribeToLogs();
  }, []);

  const checkDevices = async () => {
    try {
      const { data, error } = await supabase
        .from('devices')
        .select('*');

      if (error) throw error;

      if (data && data.length > 0) {
        setDevices(data);
        setApiSecret(data[0].api_secret);
        setStatus('✅ Device found: ' + data[0].name);
      } else {
        setStatus('❌ No devices registered');
      }
    } catch (error) {
      setStatus('❌ Error loading devices: ' + String(error));
    }
  };

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance_logs')
        .select('*, student:students(*)')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const subscribeToLogs = () => {
    const channel = supabase
      .channel('test-attendance')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'attendance_logs',
        },
        (payload) => {
          console.log('🔔 New attendance log received:', payload);
          fetchLogs(); // Refresh the list
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const testAPI = async () => {
    if (!apiSecret) {
      alert('No device secret found. Create a device first.');
      return;
    }

    try {
      const response = await fetch(
        'https://ca3f638c-aef4-441d-8ce7-7eecd2daba00.canvases.tempo.build/api/log-attendance',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-device-secret': apiSecret,
          },
          body: JSON.stringify({
            uid: '12345678',
            type: 'IN',
          }),
        }
      );

      const data = await response.json();
      console.log('API Response:', data);
      alert('✅ API Test Result:\n' + JSON.stringify(data, null, 2));

      // Refresh logs
      setTimeout(fetchLogs, 1000);
    } catch (error) {
      console.error('API Test Error:', error);
      alert('❌ API Test Failed:\n' + String(error));
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">🧪 Attendance API Test</h1>

        {/* Status Section */}
        <div className="bg-slate-800 rounded-lg p-6 mb-8 border border-slate-700">
          <h2 className="text-xl font-bold mb-4">Status</h2>
          <p className="text-lg mb-4">{status}</p>

          {devices.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-slate-400">Device Secret:</p>
              <code className="bg-slate-900 p-3 rounded text-xs block break-all">
                {apiSecret}
              </code>
            </div>
          )}
        </div>

        {/* Test Button */}
        <div className="mb-8">
          <button
            onClick={testAPI}
            className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-3 px-6 rounded-lg transition"
          >
            🚀 Send Test Scan (UID: 12345678)
          </button>
        </div>

        {/* Recent Logs */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-2xl font-bold mb-6">📋 Recent Attendance Logs</h2>

          {logs.length === 0 ? (
            <div className="text-slate-400 text-center py-8">
              <p>No attendance logs yet</p>
              <p className="text-sm mt-2">Scan a card or click "Send Test Scan" above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="bg-slate-700 p-4 rounded border border-slate-600 hover:border-cyan-500 transition"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400">UID</p>
                      <p className="font-mono text-sm">{log.uid}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Student</p>
                      <p className="text-sm">{log.student?.name || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Status</p>
                      <p
                        className={`text-sm font-bold ${
                          log.status === 'success'
                            ? 'text-green-400'
                            : log.status === 'duplicate'
                            ? 'text-amber-400'
                            : 'text-red-400'
                        }`}
                      >
                        {log.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Time</p>
                      <p className="text-sm">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ESP8266 Instructions */}
        <div className="mt-8 bg-blue-900 border border-blue-700 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">📱 ESP8266 Checklist</h3>
          <ul className="space-y-2 text-sm">
            <li>✅ Update WiFi SSID and password in ESP8266 code</li>
            <li>✅ Copy device secret from above: <code className="bg-slate-900 px-2 py-1 rounded">{apiSecret}</code></li>
            <li>✅ Add this URL to ESP8266: <code className="bg-slate-900 px-2 py-1 rounded">https://ca3f638c-aef4-441d-8ce7-7eecd2daba00.canvases.tempo.build/api/log-attendance</code></li>
            <li>✅ Use HTTPS (not HTTP)</li>
            <li>✅ Make sure your student is added with the correct RFID UID</li>
            <li>✅ Check browser console (F12) for real-time log updates</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
