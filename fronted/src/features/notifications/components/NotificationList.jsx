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

  useEffect(() => {
    loadNotifications({ page, filter:statusFilter });
  }, [page, statusFilter]);

  const handleFilterChange = (filter) => {
    setStatusFilter(filter);
    setPage(1); 
    setSelectedNotifications([]); 
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto px-4"> {/* Added max-width and horizontal padding */}
      <div className="flex flex-wrap gap-2 mb-4 justify-center"> {/* Changed to flex-wrap and centered */}
        {Object.entries(STATUS_FILTERS).map(([key, {value,label}]) => (
          <button
            key={key}
            onClick={() => handleFilterChange(value)}
            className={`px-4 py-2 text-sm rounded-full transition-colors ${
              statusFilter === value 
                ? 'bg-[#184494ff] text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {label}
          </button>
        ))}

        {hasSelected && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-[#088404] text-white rounded-full hover:bg-green-500 transition-colors"
          >
            Atender seleccionadas ({selectedNotifications.length})
          </button>
        )}
      </div>
      
      {statusFilter !== 'attended' && allSelectable.length > 0 && (
        <div className="flex items-center mb-2 justify-center"> {/* Centered the select all */}
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
          <div className="text-center py-12 text-gray-500 text-lg"> {/* Increased padding */}
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
        <div className="flex justify-center mt-6 space-x-2"> {/* Increased top margin */}
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition-colors"
          >
            Anterior
          </button>
          <span className="px-4 py-2 flex items-center">
            Página {page} de {notificationsData.totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(notificationsData.totalPages, p + 1))}
            disabled={page === notificationsData.totalPages}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition-colors"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );  
}