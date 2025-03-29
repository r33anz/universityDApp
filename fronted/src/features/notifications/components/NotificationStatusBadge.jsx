import React from "react";

export function NotificationStatusBadge({ status  }) {
  const statusStyles = {
      attended: 'bg-green-100 text-green-800',
      in_process: 'bg-yellow-100 text-yellow-800',
      not_attended: 'bg-red-100 text-red-800'
    };

  const statusText = {
      attended: 'Atendido',
      in_process: 'En progreso',
      not_attended: 'No atendido'
  };

  return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status]}`}>
          {statusText[status]}
      </span>
  );
  }