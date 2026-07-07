import React from "react";
import { AlertTriangleIcon } from "../../../shared/components/Icons";

export function ConfirmationModal({ isOpen, onClose, onConfirm, selectedCount }) {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="theme-card rounded-2xl p-6 max-w-md w-full shadow-xl border" style={{ borderColor: 'var(--border-primary)' }}>
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-brand-gold/10 dark:bg-brand-gold/20 rounded-xl flex-shrink-0">
              <AlertTriangleIcon className="w-5 h-5 text-brand-gold" />
            </div>
            <div>
              <h3 className="text-lg font-semibold theme-text mb-1">Confirmar envio</h3>
              <p className="text-sm theme-text-secondary">
                Se atenderan {selectedCount} notificacion(es) seleccionada(s).
                Los codigos SIS correspondientes se enviaran al sistema WEBSIS.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium theme-text-secondary theme-card border rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              style={{ borderColor: 'var(--border-primary)' }}
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2.5 text-sm font-medium text-white bg-brand-blue rounded-lg hover:bg-brand-blue/90 transition-colors"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    );
}
