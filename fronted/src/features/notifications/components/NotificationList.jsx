import React,{useState,useEffect} from "react";
import { useNotifications } from "../hooks/useNotification";
import { NotificationItem } from "./NotificationItem";
import { ConfirmationModal } from "./ModalToAttendNotifications";

export const STATUS_FILTERS = {
  ALL:  {value:'ALL', label:"Todas"},
  ATTENDED: {value:'attended',label:"Atendidas"},
  IN_PROCESS: {value:'in_process',label:"En progreso"},
  NOT_ATTENDED: {value:'not_attended',label:"No atendidas"}
};

export function NotificationList() {
  const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState(STATUS_FILTERS.ALL.value);

    const { 
      notificationsData = { notifications: [], totalPages: 1 } ,
      selectedNotifications = [],
      toggleNotificationSelection,
      setSelectedNotifications,
      toggleSelectAll,
      attendSelected,
      isModalOpen,
      setIsModalOpen,
      loadNotifications
    } = useNotifications();

    const notifications = notificationsData.notifications || [];
    const allSelectable = notifications.filter(n => n.status === 'not_attended');
    const hasSelected = selectedNotifications.length > 0;
    const [attendanceResult, setAttendanceResult] = useState(null);

    useEffect(() => {
      loadNotifications({ page, filter:statusFilter });
    }, [page, statusFilter]);

    const handleFilterChange = (filter) => {
      setStatusFilter(filter);
      setPage(1); 
      setSelectedNotifications([]); 
    };

    return (
        <div className="space-y-4 mx-auto">
            {/* Filtros */}
            <div className="flex space-x-2 mb-4">
                {Object.entries(STATUS_FILTERS).map(([key, {value,label}]) => (
                    <button
                        key={key}
                        onClick={() => handleFilterChange(value)}
                        className={`px-3 py-1 text-sm rounded-full ${
                            statusFilter === value 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-200 text-gray-700'
                        }`}
                    >
                        {label}
                    </button>
                ))}

              {hasSelected && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Atender seleccionadas ({selectedNotifications.length})
                  </button>
                )}
            </div>
            
            {/* Checkbox para seleccionar todas */}
            {statusFilter !== 'attended' && allSelectable.length > 0 && (
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={selectedNotifications.length === allSelectable.length}
                  onChange={() => toggleSelectAll(allSelectable)}
                  className="mr-2 h-4 w-4"
                />
                <span className="text-sm text-gray-600">
                  Seleccionar todas ({allSelectable.length})
                </span>
              </div>
            )}


            {/* Lista de notificaciones */}
            <div className="space-y-4">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    isSelected={selectedNotifications.includes(notification.id)}
                    onToggleSelect={() => toggleNotificationSelection(notification.id)}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No hay notificaciones para mostrar
                </div>
              )}
            </div>
            
            <ConfirmationModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onConfirm={attendSelected}
              selectedCount={selectedNotifications.length}
            />

            {/* Paginación */}
            {notificationsData.totalPages > 1 && (
                <div className="flex justify-center mt-4 space-x-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                    >
                        Anterior
                    </button>
                    <span className="px-3 py-1">
                        Página {page} de {notificationsData.totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(notificationsData.totalPages, p + 1))}
                        disabled={page === notificationsData.totalPages}
                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                    >
                        Siguiente
                    </button>
                </div>
            )}

        </div>
    );  
}