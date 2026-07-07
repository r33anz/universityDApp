import React from 'react';
import { CheckCircleIcon, XIcon } from '../../../shared/components/Icons';

export function ResultModal({ isOpen, onClose, result }) {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="theme-card rounded-2xl p-8 max-w-sm w-full mx-4 shadow-xl border" style={{ borderColor: 'var(--border-primary)' }}>
          <div className="flex flex-col items-center">
            {result.success ? (
              <>
                <div className="w-14 h-14 bg-brand-teal/10 dark:bg-brand-teal/20 rounded-full flex items-center justify-center mb-4">
                  <CheckCircleIcon className="w-7 h-7 text-brand-teal" />
                </div>
                <h3 className="text-lg font-semibold theme-text">Completado</h3>
              </>
            ) : (
              <>
                <div className="w-14 h-14 bg-brand-red/10 dark:bg-brand-red/20 rounded-full flex items-center justify-center mb-4">
                  <XIcon className="w-7 h-7 text-brand-red" />
                </div>
                <h3 className="text-lg font-semibold theme-text">Error</h3>
              </>
            )}
            <p className="mt-2 text-sm theme-text-secondary text-center">{result.message}</p>
            <button
              onClick={onClose}
              className="mt-6 w-full px-4 py-2.5 bg-brand-blue text-white rounded-lg text-sm font-medium hover:bg-brand-blue/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    );
}
