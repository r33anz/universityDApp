import React from "react"
import { createPortal } from "react-dom"
import { AlertTriangleIcon, CheckCircleIcon, XIcon, InfoIcon } from "./Icons"

export const ToastContainer = ({ children }) => {
  return createPortal(
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col gap-2 items-center">
      {children}
    </div>,
    document.body,
  )
}

export const Toast = ({ message, type = "info", onClose, autoClose = true, duration = 5000 }) => {
  React.useEffect(() => {
    let timer
    if (autoClose) {
      timer = setTimeout(() => {
        onClose()
      }, duration)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [autoClose, duration, onClose])

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case "error":
        return <AlertTriangleIcon className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertTriangleIcon className="h-5 w-5 text-yellow-500" />
      default:
        return <InfoIcon className="h-5 w-5 text-blue-500" />
    }
  }

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200"
      case "error":
        return "bg-red-50 border-red-200"
      case "warning":
        return "bg-yellow-50 border-yellow-200"
      default:
        return "bg-blue-50 border-blue-200"
    }
  }

  return (
    <div className={`rounded-lg shadow-md border p-4 ${getBackgroundColor()} animate-in slide-in-from-right`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">{getIcon()}</div>
        <div className="flex-1">
          <p className="text-sm text-gray-800">{message}</p>
        </div>
        <button onClick={onClose} className="ml-4 text-gray-400 hover:text-gray-600">
          <XIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

