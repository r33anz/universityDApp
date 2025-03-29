import React from "react";
import { NotificationStatusBadge } from "./NotificationStatusBadge";

export function NotificationItem({ notification, isSelected, onToggleSelect }) {

    
    return (
      <div className={`p-4 mb-4 rounded-lg shadow-sm flex items-start ${
        notification.status === 'not_attended' 
          ? 'bg-white border border-gray-200' 
          : 'bg-gray-100'
      }`}>
        {notification.status === 'not_attended' && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(notification.id)}
            className="mt-1 mr-3 h-4 w-4"
          />
        )}
        
        <div className="flex-1">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">{notification.title}</h3>
            <NotificationStatusBadge status={notification.status} />
          </div>
          <p className="text-gray-700 mb-2">{notification.message}</p>
          <p className="text-sm text-gray-500">
            {notification.emittedAt}
          </p>
        </div>
      </div>
    );
  }