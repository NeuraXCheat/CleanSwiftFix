
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "highlight";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  loading?: boolean;
  animation?: "pulse" | "scale" | "none";
}

export function AnimatedButton({
  children,
  variant = "default",
  size = "default",
  className,
  loading = false,
  animation = "scale",
  disabled,
  ...props
}: AnimatedButtonProps) {
  const getVariantClass = () => {
    if (variant === "highlight") {
      return "bg-highlight text-highlight-foreground hover:bg-highlight/90";
    }
    return "";
  };

  const getAnimationClass = () => {
    switch (animation) {
      case "pulse":
        return "transition-all duration-300 hover:shadow-md active:scale-[0.98]";
      case "scale":
        return "transition-all duration-200 hover:shadow-md active:scale-[0.98] transform hover:scale-[1.02]";
      default:
        return "";
    }
  };

  return (
    <Button
      variant={variant === "highlight" ? "default" : variant}
      size={size}
      disabled={disabled || loading}
      className={cn(
        getVariantClass(),
        getAnimationClass(),
        loading ? "opacity-80 pointer-events-none" : "",
        className
      )}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {children}
        </div>
      ) : (
        children
      )}
    </Button>
  );
}

export default AnimatedButton;
