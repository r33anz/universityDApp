import { useState } from "react";
import { notificationsData } from "../service/notificationService";

export function useNotifications(){
    const [notifications, setNotifications] = useState(notificationsData)
    
    const markAsRead = (id) => {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === id
              ? { ...notification, status: "read" }
              : notification
          )
        );
      };

    return { notifications, markAsRead };
}