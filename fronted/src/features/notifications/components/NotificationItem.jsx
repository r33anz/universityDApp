import React, { useState } from "react";
import { NotificationStatusBadge } from "./NotificationStatusBadge";

export const NotificationItem = React.memo(function NotificationItem({ notification, isSelected, onToggleSelect, onAttendSingle }) {
  const [isAttending, setIsAttending] = useState(false);
  const isActionable = notification.status === 'not_attended';

  const handleAttend = async (e) => {
    e.stopPropagation();
    setIsAttending(true);
    await onAttendSingle(notification.id);
  };

  return (
    <div className={`p-4 rounded-xl flex items-start transition-all duration-200 ${
      isActionable
        ? `theme-card border ${isSelected ? 'border-brand-blue/30 dark:border-brand-blue/50 shadow-sm' : 'hover:border-[var(--text-tertiary)]'}`
        : 'theme-muted border border-transparent'
    }`}
    style={isActionable && !isSelected ? { borderColor: 'var(--border-primary)' } : {}}
    >
      {isActionable && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(notification.id)}
          className="mt-1 mr-3 h-4 w-4 flex-shrink-0 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
          aria-label={`Seleccionar notificación: ${notification.title}`}
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3 mb-1.5">
          <h3 className="text-sm font-semibold theme-text truncate" title={notification.title}>
            {notification.title}
          </h3>
          <NotificationStatusBadge status={notification.status} />
        </div>
        <p className="text-sm theme-text-secondary mb-2 line-clamp-2" title={notification.message}>
          {notification.message}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-xs theme-text-tertiary">{notification.emittedAt}</p>
          {isActionable && (
            <button
              onClick={handleAttend}
              disabled={isAttending}
              className="px-3 py-1 text-xs font-medium rounded-lg bg-brand-teal/10 dark:bg-brand-teal/20 text-brand-teal hover:bg-brand-teal/20 dark:hover:bg-brand-teal/30 transition-colors disabled:opacity-50"
            >
              {isAttending ? "Atendiendo..." : "Atender"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
});
