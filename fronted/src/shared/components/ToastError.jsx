import React from "react";
import { createPortal } from "react-dom";
import { AlertTriangleIcon, CheckCircleIcon, XIcon, InfoIcon } from "./Icons";

export const ToastContainer = ({ children }) => {
  return createPortal(
    <div
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col gap-2 items-center"
      role="alert"
      aria-live="polite"
    >
      {children}
    </div>,
    document.body,
  );
};

export const Toast = ({ message, type = "info", onClose, autoClose = true, duration = 5000 }) => {
  React.useEffect(() => {
    let timer;
    if (autoClose) {
      timer = setTimeout(() => {
        onClose();
      }, duration);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [autoClose, duration, onClose]);

  const styles = {
    success: { bg: "bg-brand-teal/5 dark:bg-brand-teal/10 border-brand-teal/20", icon: <CheckCircleIcon className="h-5 w-5 text-brand-teal" /> },
    error:   { bg: "bg-brand-red/5 dark:bg-brand-red/10 border-brand-red/20", icon: <AlertTriangleIcon className="h-5 w-5 text-brand-red" /> },
    warning: { bg: "bg-brand-gold/5 dark:bg-brand-gold/10 border-brand-gold/20", icon: <AlertTriangleIcon className="h-5 w-5 text-brand-gold" /> },
    info:    { bg: "bg-brand-blue/5 dark:bg-brand-blue/10 border-brand-blue/20", icon: <InfoIcon className="h-5 w-5 text-brand-blue" /> },
  };

  const { bg, icon } = styles[type] || styles.info;

  return (
    <div className={`rounded-xl shadow-lg border px-4 py-3 ${bg} backdrop-blur-sm min-w-[300px] max-w-md`} style={{ backgroundColor: 'var(--bg-card)' }}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3 mt-0.5">{icon}</div>
        <div className="flex-1">
          <p className="text-sm theme-text">{message}</p>
        </div>
        <button onClick={onClose} className="ml-3 theme-text-tertiary hover:opacity-80 transition-colors">
          <XIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
