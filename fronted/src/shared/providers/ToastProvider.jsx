import React,{ createContext,useContext } from "react";
import { useToast } from "../hooks/useToast";
import { Toast,ToastContainer } from "../components/ToastError";

const ToastContext = createContext(null)

export const useToastContext = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToastContext debe ser usado dentro de un ToastProvider")
  }
  return context
}

export const ToastProvider = ({ children }) => {
  const toast = useToast()

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer>
        {toast.toasts.map((t) => (
          <Toast
            key={t.id}
            message={t.message}
            type={t.type}
            duration={t.duration}
            onClose={() => toast.removeToast(t.id)}
          />
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  )
}