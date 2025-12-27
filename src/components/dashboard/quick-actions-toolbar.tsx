"use client";

import { useState } from "react";
import { Upload, UserPlus, Download, Trash2, Plus } from "lucide-react";

interface QuickActionsToolbarProps {
  onBulkImport: () => void;
  onAddStudent: () => void;
  onExportReport: () => void;
  onClearCache: () => void;
  onManualEntry: () => void;
}

export function QuickActionsToolbar({
  onBulkImport,
  onAddStudent,
  onExportReport,
  onClearCache,
  onManualEntry,
}: QuickActionsToolbarProps) {
  const actions = [
    {
      label: "Bulk Import",
      icon: Upload,
      onClick: onBulkImport,
      variant: "primary" as const,
    },
    {
      label: "Add Student",
      icon: UserPlus,
      onClick: onAddStudent,
      variant: "default" as const,
    },
    {
      label: "Export Report",
      icon: Download,
      onClick: onExportReport,
      variant: "default" as const,
    },
    {
      label: "Log Attendance",
      icon: Plus,
      onClick: onManualEntry,
      variant: "default" as const,
    },
    {
      label: "Clear Cache",
      icon: Trash2,
      onClick: onClearCache,
      variant: "destructive" as const,
    },
  ];

  const getVariantStyles = (variant: "primary" | "default" | "destructive") => {
    switch (variant) {
      case "primary":
        return "bg-primary text-primary-foreground hover:bg-primary/90 border-primary/30";
      case "destructive":
        return "bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/30";
      default:
        return "bg-secondary hover:bg-secondary/80 text-foreground border-border/50";
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            onClick={action.onClick}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all hover:scale-105 active:scale-95 border flex items-center gap-2 ${getVariantStyles(
              action.variant
            )}`}
          >
            <Icon className="w-4 h-4" />
            {action.label}
          </button>
        );
      })}
    </div>
  );
}
