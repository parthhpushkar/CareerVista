import * as React from "react";
import { cn } from "@/lib/utils";

function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "secondary" | "destructive" | "outline";
}) {
  const variants = {
    default: "bg-forest text-white",
    secondary: "bg-forest-50 text-forest-700 border border-forest-200",
    destructive: "bg-red-100 text-red-700 border border-red-200",
    outline: "border border-border text-foreground",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
