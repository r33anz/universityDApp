import React,{ useState, useCallback } from "react"

export const useToast = () => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = "info", duration = 5000) => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, message, type, duration }])
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const success = useCallback(
    (message, duration) => {
      return addToast(message, "success", duration)
    },
    [addToast],
  )

  const error = useCallback(
    (message, duration) => {
      return addToast(message, "error", duration)
    },
    [addToast],
  )

  const warning = useCallback(
    (message, duration) => {
      return addToast(message, "warning", duration)
    },
    [addToast],
  )

  const info = useCallback(
    (message, duration) => {
      return addToast(message, "info", duration)
    },
    [addToast],
  )

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  }
}
