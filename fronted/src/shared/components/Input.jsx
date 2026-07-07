import React from "react";
import cn from "../lib/utils";

export const Input = React.forwardRef(({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border px-3 py-2 text-sm transition-colors theme-text placeholder:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          "bg-white dark:bg-white/5 border-gray-300 dark:border-white/10",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  })

Input.displayName = "Input"
