import React from "react";
import cn from "../lib/utils";


const buttonVariants = {
    default: "bg-[#184494ff] text-white hover:bg-[#184494ff]/90",
    destructive: "bg-[#e80414ff] text-white hover:bg-[#e80414ff]/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-[#107e7dff] text-white hover:bg-[#107e7dff]/90",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-[#184494ff] underline-offset-4 hover:underline",
  }
  
  const buttonSizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  }
  
  export const Button = React.forwardRef(
    ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
      const Comp = asChild ? React.Fragment : "button"
      return (
        <Comp
          className={cn(
            "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            buttonVariants[variant],
            buttonSizes[size],
            className,
          )}
          ref={ref}
          {...props}
        />
      )
    },
  )
  
  Button.displayName = "Button"
  
  