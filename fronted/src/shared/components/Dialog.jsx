import React from "react";
import cn from "../lib/utils";

export const Dialog = ({ children, open, onOpenChange }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div className="theme-card rounded-2xl shadow-xl max-w-md w-full mx-4 border" style={{ borderColor: 'var(--border-primary)' }}>
        {children}
      </div>
    </div>
  );
};

export const DialogContent = ({ children, className, ...props }) => (
  <div className={cn("p-6", className)} {...props}>{children}</div>
);

export const DialogHeader = ({ children, className, ...props }) => (
  <div className={cn("mb-4", className)} {...props}>{children}</div>
);

export const DialogFooter = ({ children, className, ...props }) => (
  <div className={cn("mt-6 flex justify-end space-x-2", className)} {...props}>{children}</div>
);

export const DialogTitle = ({ children, className, ...props }) => (
  <h2 className={cn("text-lg font-semibold theme-text", className)} {...props}>{children}</h2>
);

export const DialogDescription = ({ children, className, ...props }) => (
  <p className={cn("text-sm theme-text-secondary", className)} {...props}>{children}</p>
);
