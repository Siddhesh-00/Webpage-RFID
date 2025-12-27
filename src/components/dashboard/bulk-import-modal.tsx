"use client";

import { useState } from "react";
import { X, Upload, AlertCircle, CheckCircle2 } from "lucide-react";

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (students: any[]) => void;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export function BulkImportModal({
  isOpen,
  onClose,
  onSubmit,
}: BulkImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsValidating(true);

    try {
      const text = await selectedFile.text();
      const lines = text.split("\n").filter((line) => line.trim());
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

      const requiredHeaders = ["uid", "name"];
      const missingHeaders = requiredHeaders.filter(
        (h) => !headers.includes(h)
      );

      if (missingHeaders.length > 0) {
        setErrors([
          {
            row: 0,
            field: "headers",
            message: `Missing required columns: ${missingHeaders.join(", ")}`,
          },
        ]);
        setIsValidating(false);
        return;
      }

      const students = [];
      const validationErrors: ValidationError[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        const student: any = {};

        headers.forEach((header, index) => {
          student[header] = values[index] || null;
        });

        if (!student.uid) {
          validationErrors.push({
            row: i + 1,
            field: "uid",
            message: "UID is required",
          });
        }

        if (!student.name) {
          validationErrors.push({
            row: i + 1,
            field: "name",
            message: "Name is required",
          });
        }

        students.push(student);
      }

      setPreview(students);
      setErrors(validationErrors);
    } catch (error) {
      setErrors([
        {
          row: 0,
          field: "file",
          message: "Failed to parse CSV file",
        },
      ]);
    }

    setIsValidating(false);
  };

  const handleSubmit = () => {
    if (errors.length > 0) return;
    onSubmit(preview);
    handleClose();
  };

  const handleClose = () => {
    setFile(null);
    setPreview([]);
    setErrors([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="glassmorphic rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold font-['Space_Grotesk']">
            Bulk Import Students
          </h3>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Upload CSV File
            </label>
            <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center hover:border-primary/50 transition-all">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop or click to upload
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:bg-primary/90 transition-all"
              >
                Select CSV File
              </label>
              {file && (
                <p className="text-sm text-primary mt-2 font-['JetBrains_Mono']">
                  {file.name}
                </p>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Required columns: uid, name. Optional: department, year,
              roll_number, parent_contact
            </p>
          </div>

          {/* Validation Errors */}
          {errors.length > 0 && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <span className="font-medium text-destructive">
                  Validation Errors ({errors.length})
                </span>
              </div>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {errors.slice(0, 5).map((error, index) => (
                  <p key={index} className="text-sm text-destructive">
                    Row {error.row}: {error.message}
                  </p>
                ))}
                {errors.length > 5 && (
                  <p className="text-sm text-destructive">
                    ... and {errors.length - 5} more errors
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Preview */}
          {preview.length > 0 && errors.length === 0 && (
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span className="font-medium text-primary">
                  Valid Data ({preview.length} students)
                </span>
              </div>
              <div className="overflow-x-auto max-h-60">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="px-2 py-1 text-left">UID</th>
                      <th className="px-2 py-1 text-left">Name</th>
                      <th className="px-2 py-1 text-left">Department</th>
                      <th className="px-2 py-1 text-left">Year</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 5).map((student, index) => (
                      <tr key={index} className="border-t border-border/30">
                        <td className="px-2 py-1 font-['JetBrains_Mono']">
                          {student.uid}
                        </td>
                        <td className="px-2 py-1">{student.name}</td>
                        <td className="px-2 py-1">{student.department || "-"}</td>
                        <td className="px-2 py-1">{student.year || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.length > 5 && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    ... and {preview.length - 5} more students
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-lg font-medium text-sm bg-secondary hover:bg-secondary/80 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={preview.length === 0 || errors.length > 0}
              className="px-4 py-2 rounded-lg font-medium text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Import {preview.length} Students
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
