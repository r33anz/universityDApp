import React from "react";
import { NotificationCard } from "./NotificationCard";
import { useNotifications } from "../hooks/useNotification";

export function NotificationList() {
    const { notifications, markAsRead } = useNotifications();
  
    return (
      <div className="space-y-4  mx-auto h-[calc(100vh-230px)] overflow-y-scroll scrollbar-hide">
      {notifications
        .sort((a, b) => new Date(b.emmittedAt) - new Date(a.emmittedAt)) 
        .map((notification) => (
          
          <NotificationCard
            key={notification.id}
            notification={notification}
            markAsRead={markAsRead}
          />
        ))}
    </div>
    );
  }