import { useState,useEffect } from "react";
import { listenForNotifications,recoverAllNotifications } from "../service/notificationService";

export function useNotifications(){
  const [notifications, setNotifications] = useState([]);
    
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await recoverAllNotifications();
        console.log(data.data,"DATA")
        setNotifications(data.data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchData();

    
    listenForNotifications((newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]); 
    });

  }, []);

    const markAsAttended = (id) => {
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id ? { ...notification, isAttended: true } : notification
        )
      );
    };

    return { notifications, markAsAttended };
}