import React from "react";
import { useNotifications } from "../hooks/useNotification";
import { STATUS_FILTERS } from "../notificationConstants";
import { NotificationItem } from "./NotificationItem";
import { ConfirmationModal } from "./ModalToAttendNotifications";
import { ErrorCircleIcon, NotificationsIcon } from "../../../shared/components/Icons";

export function NotificationList() {
  const {
    notificationsData,
    statusFilter,
    changePage,
    changeFilter,
    selectedNotifications,
    toggleNotificationSelection,
    setSelectedNotifications,
    toggleSelectAll,
    attendSingle,
    attendSelected,
    isModalOpen,
    setIsModalOpen,
  } = useNotifications();

  const notifications = notificationsData.notifications || [];
  const allSelectable = notifications.filter(n => n.status === 'not_attended');
  const hasSelected = selectedNotifications.length > 0;
  const page = notificationsData.page;

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-blue dark:text-blue-300 mb-1">Notificaciones</h1>
        <p className="text-sm theme-text-secondary">Gestiona las solicitudes de kardex de los estudiantes</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        {Object.entries(STATUS_FILTERS).map(([key, { value, label }]) => (
          <button
            key={key}
            onClick={() => changeFilter(value)}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200 ${
              statusFilter === value
                ? 'bg-brand-blue text-white shadow-sm'
                : 'theme-card theme-text-secondary border hover:border-brand-blue/30 hover:text-brand-blue dark:hover:text-blue-300'
            }`}
            style={statusFilter !== value ? { borderColor: 'var(--border-primary)' } : {}}
          >
            {label}
          </button>
        ))}

        {hasSelected && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="ml-auto px-4 py-2 bg-brand-teal text-white rounded-lg text-sm font-medium hover:bg-brand-teal/90 transition-colors shadow-sm"
          >
            Atender seleccionadas ({selectedNotifications.length})
          </button>
        )}
      </div>

      {statusFilter !== STATUS_FILTERS.ATTENDED.value && allSelectable.length > 0 && (
        <label className="flex items-center gap-2 mb-4 cursor-pointer group">
          <input
            type="checkbox"
            checked={selectedNotifications.length === allSelectable.length && allSelectable.length > 0}
            onChange={() => toggleSelectAll(allSelectable)}
            className="h-4 w-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
          />
          <span className="text-sm theme-text-tertiary group-hover:text-[var(--text-secondary)] transition-colors">
            Seleccionar todas ({allSelectable.length})
          </span>
        </label>
      )}

      <div className="space-y-3">
        {notificationsData.loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-8 h-8 border-[3px] border-brand-blue/20 border-t-brand-blue rounded-full animate-spin mb-4"></div>
            <p className="text-sm theme-text-secondary">Cargando notificaciones...</p>
          </div>
        ) : notificationsData.error ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-brand-red/10 dark:bg-brand-red/20 flex items-center justify-center">
              <ErrorCircleIcon className="w-6 h-6 text-brand-red" />
            </div>
            <p className="theme-text-secondary mb-2">{notificationsData.error}</p>
            <button
              onClick={() => changePage(page)}
              className="text-sm text-brand-blue dark:text-blue-300 hover:underline font-medium"
            >
              Reintentar
            </button>
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              isSelected={selectedNotifications.includes(notification.id)}
              onToggleSelect={() => toggleNotificationSelection(notification.id)}
              onAttendSingle={attendSingle}
            />
          ))
        ) : (
          <div className="text-center py-16">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl theme-muted flex items-center justify-center">
              <NotificationsIcon className="w-6 h-6 theme-text-tertiary" />
            </div>
            <p className="theme-text-secondary">No hay notificaciones para mostrar</p>
            <p className="text-xs theme-text-tertiary mt-1">Las nuevas solicitudes aparecen aquí automáticamente</p>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={attendSelected}
        selectedCount={selectedNotifications.length}
      />

      {notificationsData.totalPages > 1 && (
        <div className="flex items-center justify-center mt-8 gap-2">
          <button
            onClick={() => changePage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-medium theme-card border rounded-lg disabled:opacity-40 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            style={{ borderColor: 'var(--border-primary)' }}
          >
            Anterior
          </button>
          <span className="px-4 py-2 text-sm theme-text-tertiary">
            {page} / {notificationsData.totalPages}
          </span>
          <button
            onClick={() => changePage(page + 1)}
            disabled={page === notificationsData.totalPages}
            className="px-4 py-2 text-sm font-medium theme-card border rounded-lg disabled:opacity-40 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            style={{ borderColor: 'var(--border-primary)' }}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
