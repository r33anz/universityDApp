import React from "react";
import cn from "../lib/utils";
import { Button } from "./Button";

export const AlertDialog = ({ children, open, onOpenChange }) => {
    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 backdrop-blur-sm">
            <div className="theme-card rounded-2xl shadow-xl max-w-md w-full mx-4 border" style={{ borderColor: 'var(--border-primary)' }}>
                {children}
            </div>
        </div>
    );
};

export const AlertDialogContent = ({ children, className, ...props }) => (
    <div className={cn("p-6", className)} {...props}>{children}</div>
);

export const AlertDialogHeader = ({ children, className, ...props }) => (
    <div className={cn("mb-4", className)} {...props}>{children}</div>
);

export const AlertDialogFooter = ({ children, className, ...props }) => (
    <div className={cn("mt-6 flex justify-end space-x-2", className)} {...props}>{children}</div>
);

export const AlertDialogTitle = ({ children, className, ...props }) => (
    <h2 className={cn("text-lg font-semibold theme-text", className)} {...props}>{children}</h2>
);

export const AlertDialogDescription = ({ children, className, ...props }) => (
    <p className={cn("text-sm theme-text-secondary", className)} {...props}>{children}</p>
);

export const AlertDialogAction = ({ children, className, ...props }) => (
    <Button className={cn("bg-brand-red text-white hover:bg-brand-red/90", className)} {...props}>
      {children}
    </Button>
);

export const AlertDialogCancel = ({ children, className, ...props }) => (
    <Button variant="outline" className={cn("", className)} {...props}>
      {children}
    </Button>
);
