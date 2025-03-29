import React from "react";

export function ConfirmationModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    selectedCount 
  }) {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-semibold mb-4">Confirmar envio</h3>
          <p className="mb-4">
            ¿Estás seguro de querer atender {selectedCount} notificación(es) seleccionada(s)?
          </p>
          <p>
            Estos codigos SIS se mandaran al sistema WEBSIS
          </p>
          <div className="flex justify-end space-x-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded"
            >
              Cancelar
            </button>
            <button 
              onClick={onConfirm}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Atender
            </button>
          </div>
        </div>
      </div>
    );
  }