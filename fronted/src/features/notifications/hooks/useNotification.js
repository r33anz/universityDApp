import { useState,useEffect } from "react";
import { listenForNotifications,recoverAllNotifications } from "../service/notificationService";
import axios from "axios";

export const STATUS_FILTERS = {
  ALL: 'ALL',
  ATTENDED: 'attended',
  IN_PROCESS: 'in_process',
  NOT_ATTENDED: 'not_attended'
};

const apiUrl = `${process.env.REACT_APP_API_PROTOCOL}://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}`;

export function useNotifications(){
  const [notificationsData, setNotificationsData] = useState({
    notifications: [],
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1,
    loading: false,
    error: null
  });
  
  const [statusFilter, setStatusFilter] = useState(STATUS_FILTERS.ALL);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadNotifications = async ({page = 1, filter=null}) => {
    try {
      
      setNotificationsData(prev => ({ ...prev, loading: true }));
      
      const response = await recoverAllNotifications({ 
        page, 
        pageSize: 10, 
        statusFilter: filter 
      });
      
      setNotificationsData({
        notifications: response.notifications,
        total: response.total,
        page: response.page,
        pageSize: response.pageSize,
        totalPages: response.totalPages,
        loading: false,
        error: null
      });
      
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotificationsData(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message 
      }));
    }
  };

  useEffect(() => {
    
    loadNotifications(1, statusFilter);

    const unsubscribe = listenForNotifications((newNotification) => {
      setNotificationsData(prev => {
        if (statusFilter === STATUS_FILTERS.ALL || 
            newNotification.status === statusFilter) {
          return {
            ...prev,
            notifications: [newNotification, ...prev.notifications.slice(0, 9)],
            total: prev.total + 1
          };
        }
        return prev;
      });
    });

    return () => unsubscribe();
  }, [statusFilter]);

  const changePage = (newPage) => {
    if (newPage >= 1 && newPage <= notificationsData.totalPages) {
      loadNotifications(newPage, statusFilter);
    }
  };

  const changeFilter = (newFilter) => {
    setStatusFilter(newFilter);
    loadNotifications(1, newFilter); 
  };

  const toggleNotificationSelection = (id) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = (notifications) => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map(n => n.id));
    }
  };

  const attendSelected = async () => {
    try {
      if (selectedNotifications.length === 0) return;
      console.log("Mandando solicitud lsita ",selectedNotifications )

      const response = await axios.post(`${apiUrl}/api/attend-multiple`, {
        notificationIds: selectedNotifications 
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if(response.success){
        setIsModalOpen(false);
        setSelectedNotifications([]);
        await loadNotifications({ page: 1 });
      }
      
    } catch (error) {
      console.error("Error attending notifications:", error);
    }
  };
  
  return { 
    notificationsData,
    statusFilter,
    changePage,
    changeFilter,
    STATUS_FILTERS,
    loadNotifications,
    toggleNotificationSelection,
    toggleSelectAll,
    attendSelected,
    isModalOpen, 
    setIsModalOpen,
    setSelectedNotifications,
    selectedNotifications
  };
}