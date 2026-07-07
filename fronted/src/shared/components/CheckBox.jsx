import React from "react";
import cn from "../lib/utils";

export const Checkbox = React.forwardRef(({ className, ...props }, ref) => (
    <input
      type="checkbox"
      className={cn(
        "h-4 w-4 rounded border-gray-300 dark:border-white/20 text-brand-blue focus:ring-brand-blue dark:bg-white/5",
        className,
      )}
      ref={ref}
      {...props}
    />
  ))

Checkbox.displayName = "Checkbox"
