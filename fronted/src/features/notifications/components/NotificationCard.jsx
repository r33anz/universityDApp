import { NotificationStatusBadge } from "./NotificationStatusBadge";
import React from "react";

export function NotificationCard({ notification, markAsRead }) {
  const { id, title, message, emmittedAt, isAttended } = notification;
  
  return (
    <div
      className={`p-4 mb-4 rounded-lg shadow-md ${
        isAttended ? "bg-white" : "bg-gray-100"
      } w-full max-w-lg mx-auto`} 
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <NotificationStatusBadge status={isAttended ? "attended" : "unattended"} />
      </div>
      <p className="text-gray-700 mb-2">{message}</p>
      <p className="text-sm text-gray-500">{emmittedAt}</p>
      {!isAttended && (
        <button
          onClick={() => markAsRead(id)}
          className="mt-2 text-sm text-blue-500 hover:text-blue-700"
        >
          Marcar como atendida
        </button>
      )}
    </div>
  );
}
