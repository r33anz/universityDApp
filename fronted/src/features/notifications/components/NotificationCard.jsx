import { NotificationStatusBadge } from "./NotificationStatusBadge";
import React from "react";

export function NotificationCard({ notification, markAsRead }) {
  const { id, title, body, date, status } = notification;

  return (
    <div
      className={`p-4 mb-4 rounded-lg shadow-md ${
        status === "attended" ? "bg-white" : "bg-gray-100"
      } w-80 mx-auto`}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <NotificationStatusBadge status={status} />
      </div>
      <p className="text-gray-700 mb-2">{body}</p>
      <p className="text-sm text-gray-500">{new Date(date).toLocaleString()}</p>
      {status === "attended" && (
        <button
          onClick={() => markAsRead(id)}
          className="mt-2 text-sm text-blue-500 hover:text-blue-700"
        >
          Marcar como leída
        </button>
      )}
    </div>
  );
}