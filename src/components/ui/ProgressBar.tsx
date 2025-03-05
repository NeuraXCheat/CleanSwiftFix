
import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "info" | "warning" | "danger";
  className?: string;
  animated?: boolean;
}

export function ProgressBar({
  value,
  max,
  label,
  showValue = false,
  size = "md",
  variant = "default",
  className,
  animated = true,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.round((value / max) * 100));

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "h-1.5";
      case "md":
        return "h-2.5";
      case "lg":
        return "h-4";
      default:
        return "h-2.5";
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case "success":
        return "bg-green-500";
      case "info":
        return "bg-highlight";
      case "warning":
        return "bg-amber-500";
      case "danger":
        return "bg-red-500";
      default:
        return "bg-highlight";
    }
  };

  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="flex justify-between mb-1 text-sm">
          {label && <span className="text-gray-700">{label}</span>}
          {showValue && (
            <span className="text-gray-700">
              {value} / {max} ({percentage}%)
            </span>
          )}
        </div>
      )}
      <div className={cn("w-full bg-gray-200 rounded-full overflow-hidden", getSizeClasses())}>
        <div
          className={cn(
            "rounded-full transition-all duration-500 ease-out",
            getVariantClasses(),
            getSizeClasses(),
            animated && "animate-pulse"
          )}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

export default ProgressBar;
