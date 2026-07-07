import React from "react";
import cn from "../lib/utils";

const buttonVariants = {
    default: "bg-brand-blue text-white hover:bg-brand-blue/90",
    destructive: "bg-brand-red text-white hover:bg-brand-red/90",
    outline: "border theme-text-secondary hover:bg-black/5 dark:hover:bg-white/10",
    secondary: "bg-brand-teal text-white hover:bg-brand-teal/90",
    ghost: "hover:bg-black/5 dark:hover:bg-white/10 theme-text-secondary",
    link: "text-brand-blue dark:text-blue-300 underline-offset-4 hover:underline",
};

const buttonSizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
};

export const Button = React.forwardRef(
    ({ className, variant = "default", size = "default", ...props }, ref) => {
      return (
        <button
          className={cn(
            "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            buttonVariants[variant],
            buttonSizes[size],
            className,
          )}
          ref={ref}
          {...props}
        />
      );
    },
);

Button.displayName = "Button";
