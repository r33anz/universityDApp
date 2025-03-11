import React from "react";
import cn from "../lib/utils";
import { Button } from "./Button";

export const AlertDialog = ({Children,open,inOpenChange}) =>{
    if(!open){
        return null
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                {children}
            </div>
        </div>
    )
}

export const AlertDialogContent = ({ children, className, ...props }) => (
    <div className={cn("p-6", className)} {...props}>
      {children}
    </div>
  )
  
  export const AlertDialogHeader = ({ children, className, ...props }) => (
    <div className={cn("mb-4", className)} {...props}>
      {children}
    </div>
  )
  
  export const AlertDialogFooter = ({ children, className, ...props }) => (
    <div className={cn("mt-6 flex justify-end space-x-2", className)} {...props}>
      {children}
    </div>
  )
  
  export const AlertDialogTitle = ({ children, className, ...props }) => (
    <h2 className={cn("text-lg font-semibold", className)} {...props}>
      {children}
    </h2>
  )
  
  export const AlertDialogDescription = ({ children, className, ...props }) => (
    <p className={cn("text-sm text-gray-500", className)} {...props}>
      {children}
    </p>
  )
  
  export const AlertDialogAction = ({ children, className, ...props }) => (
    <Button className={cn("bg-[#e80414ff] text-white hover:bg-[#e80414ff]/90", className)} {...props}>
      {children}
    </Button>
  )
  
  export const AlertDialogCancel = ({ children, className, ...props }) => (
    <Button variant="outline" className={cn("", className)} {...props}>
      {children}
    </Button>
  )
  