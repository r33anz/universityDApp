import React from "react";

export function NotificationStatusBadge({ status }) {
    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${
          status === "attended"
            ? "bg-red-100 text-red-800"
            : "bg-green-100 text-green-800"
        }`}
      >
        {status === "attended" ? "No atendida" : "Atendida"}
      </span>
    );
  }