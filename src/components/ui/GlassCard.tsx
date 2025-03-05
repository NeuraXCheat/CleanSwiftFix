
import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "light" | "dark";
  intensity?: "low" | "medium" | "high";
  className?: string;
}

export function GlassCard({
  children,
  variant = "light",
  intensity = "medium",
  className,
  ...props
}: GlassCardProps) {
  const getOpacity = () => {
    if (variant === "light") {
      return intensity === "low" 
        ? "bg-white/40" 
        : intensity === "medium" 
          ? "bg-white/60" 
          : "bg-white/80";
    } else {
      return intensity === "low" 
        ? "bg-black/20" 
        : intensity === "medium" 
          ? "bg-black/40" 
          : "bg-black/60";
    }
  };

  const getBorder = () => {
    return variant === "light" 
      ? "border border-white/20" 
      : "border border-white/10";
  };

  return (
    <div
      className={cn(
        "rounded-xl backdrop-blur-md shadow-sm",
        getOpacity(),
        getBorder(),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default GlassCard;
