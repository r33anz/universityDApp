import React from "react";
import cn from "../lib/utils";

export const Checkbox = React.forwardRef(({ className, ...props }, ref) => (
    <input
      type="checkbox"
      className={cn("h-4 w-4 rounded border-gray-300 text-[#184494ff] focus:ring-[#184494ff]", className)}
      ref={ref}
      {...props}
    />
  ))
  
  Checkbox.displayName = "Checkbox"
  