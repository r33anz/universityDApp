import React from 'react';
import { CheckCircleIcon,XIcon } from '../../../shared/components/Icons';

export function ResultModal({ isOpen, onClose, result }) {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full">
          <div className="flex flex-col items-center">
            {result.success ? (
              <>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircleIcon className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">¡Éxito!</h3>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <XIcon className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Error</h3>
              </>
            )}
            <p className="mt-2 text-sm text-gray-500 text-center">{result.message}</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    );
  }