import { useState, useEffect, useRef, useCallback } from "react";
import { listenForNotifications, recoverAllNotifications, disconnectSocket, attendNotifications } from "../service/notificationService";
import { STATUS_FILTERS } from "../notificationConstants";

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

  const [statusFilter, setStatusFilter] = useState(STATUS_FILTERS.ALL.value);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const mountedRef = useRef(true);

  const loadNotifications = useCallback(async ({page = 1, filter = null}) => {
    try {
      setNotificationsData(prev => ({ ...prev, loading: true }));

      const response = await recoverAllNotifications({
        page,
        pageSize: 10,
        statusFilter: filter
      });

      if (!mountedRef.current) return;

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
      if (!mountedRef.current) return;
      setNotificationsData(prev => ({
        ...prev,
        loading: false,
        error: "Error al cargar notificaciones"
      }));
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    loadNotifications({ page: 1, filter: statusFilter });

    const unsubscribe = listenForNotifications((newNotification) => {
      if (!mountedRef.current) return;
      setNotificationsData(prev => {
        if (statusFilter === STATUS_FILTERS.ALL.value ||
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

    return () => {
      mountedRef.current = false;
      unsubscribe();
      disconnectSocket();
    };
  }, [statusFilter, loadNotifications]);

  const changePage = (newPage) => {
    if (newPage >= 1 && newPage <= notificationsData.totalPages) {
      loadNotifications({ page: newPage, filter: statusFilter });
    }
  };

  const changeFilter = (newFilter) => {
    setStatusFilter(newFilter);
    setSelectedNotifications([]);
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

  const attendSingle = async (notificationId) => {
    try {
      const response = await attendNotifications([notificationId]);
      if (!mountedRef.current) return;
      if (response.success) {
        await loadNotifications({ page: notificationsData.page, filter: statusFilter });
      }
    } catch (error) {
      if (!mountedRef.current) return;
      setNotificationsData(prev => ({
        ...prev,
        error: "Error al atender la notificación"
      }));
    }
  };

  const attendSelected = async () => {
    try {
      if (selectedNotifications.length === 0) return;

      const response = await attendNotifications(selectedNotifications);

      if (!mountedRef.current) return;

      if(response.success){
        setIsModalOpen(false);
        setSelectedNotifications([]);
        await loadNotifications({ page: 1 });
      }

    } catch (error) {
      if (!mountedRef.current) return;
      setNotificationsData(prev => ({
        ...prev,
        error: "Error al atender notificaciones"
      }));
    }
  };

  return {
    notificationsData,
    statusFilter,
    changePage,
    changeFilter,
    loadNotifications,
    toggleNotificationSelection,
    toggleSelectAll,
    attendSingle,
    attendSelected,
    isModalOpen,
    setIsModalOpen,
    setSelectedNotifications,
    selectedNotifications
  };
}
