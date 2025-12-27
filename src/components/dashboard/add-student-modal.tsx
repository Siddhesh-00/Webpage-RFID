"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (student: {
    uid: string;
    name: string;
    department: string;
    year: string;
    roll_number: string;
    parent_contact: string;
  }) => void;
}

export function AddStudentModal({
  isOpen,
  onClose,
  onSubmit,
}: AddStudentModalProps) {
  const [formData, setFormData] = useState({
    uid: "",
    name: "",
    department: "",
    year: "",
    roll_number: "",
    parent_contact: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.uid.trim()) newErrors.uid = "UID is required";
    if (!formData.name.trim()) newErrors.name = "Name is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
    setFormData({
      uid: "",
      name: "",
      department: "",
      year: "",
      roll_number: "",
      parent_contact: "",
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="glassmorphic rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold font-['Space_Grotesk']">
            Add New Student
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                UID <span className="text-destructive">*</span>
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
              {errors.uid && (
                <p className="text-destructive text-xs mt-1">{errors.uid}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                placeholder="Enter student name"
              />
              {errors.name && (
                <p className="text-destructive text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                placeholder="e.g., Computer Science"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Year</label>
              <input
                type="text"
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: e.target.value })
                }
                className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                placeholder="e.g., 2024"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Roll Number
              </label>
              <input
                type="text"
                value={formData.roll_number}
                onChange={(e) =>
                  setFormData({ ...formData, roll_number: e.target.value })
                }
                className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-['JetBrains_Mono']"
                placeholder="e.g., CS2024001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Parent Contact
              </label>
              <input
                type="text"
                value={formData.parent_contact}
                onChange={(e) =>
                  setFormData({ ...formData, parent_contact: e.target.value })
                }
                className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-['JetBrains_Mono']"
                placeholder="Phone number"
              />
            </div>
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
              Add Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
