import React from "react";

export function NotificationStatusBadge({ isAttended }) {
    return (
      <span
      className={`px-2 py-1 text-xs font-semibold rounded-full ${
        isAttended ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`}
    >
      {isAttended ? "Atendida" : "No atendida"}
    </span>
    );
  }