import React from "react";

export function NotificationStatusBadge({ status }) {
  const config = {
    attended: { bg: 'bg-[#107e7dff]/10', text: 'text-[#107e7dff]', label: 'Atendido' },
    in_process: { bg: 'bg-[#e3b505ff]/10', text: 'text-[#b8920a]', label: 'En progreso' },
    not_attended: { bg: 'bg-[#e80414ff]/10', text: 'text-[#e80414ff]', label: 'No atendido' }
  };

  const { bg, text, label } = config[status] || config.not_attended;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${bg} ${text}`}>
      {label}
    </span>
  );
}
