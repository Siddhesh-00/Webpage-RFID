"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { uid: string; timestamp: string }) => void;
}

export function ManualEntryModal({
  isOpen,
  onClose,
  onSubmit,
}: ManualEntryModalProps) {
  const [formData, setFormData] = useState({
    uid: "",
    timestamp: new Date().toISOString().slice(0, 16),
  });

  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.uid.trim()) {
      setError("UID is required");
      return;
    }

    onSubmit(formData);
    setFormData({
      uid: "",
      timestamp: new Date().toISOString().slice(0, 16),
    });
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="glassmorphic rounded-lg p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold font-['Space_Grotesk']">
            Manual Attendance Entry
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Student UID <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={formData.uid}
              onChange={(e) =>
                setFormData({ ...formData, uid: e.target.value })
              }
              className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-['JetBrains_Mono']"
              placeholder="Enter RFID UID"
            />
            {error && <p className="text-destructive text-xs mt-1">{error}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Timestamp</label>
            <input
              type="datetime-local"
              value={formData.timestamp}
              onChange={(e) =>
                setFormData({ ...formData, timestamp: e.target.value })
              }
              className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-['JetBrains_Mono']"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-medium text-sm bg-secondary hover:bg-secondary/80 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg font-medium text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
            >
              Log Attendance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
