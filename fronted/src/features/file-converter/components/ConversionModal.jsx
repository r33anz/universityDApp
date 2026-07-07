import React from "react";
import { CheckIcon } from "../../../shared/components/Icons";

/**
 * Loading modal with two faces:
 *  1) HTTP upload phase — determinate progress bar driven by axios upload events.
 *  2) Backend processing phase — staged indicator (merge / IPFS / blockchain /
 *     confirmation) with checkmarks; replaces the "100% stuck" anti-pattern.
 *
 * Props:
 *  - progress (number|null): 0-100 during upload, null afterwards.
 *  - message (string): subtitle shown in the simple modes.
 *  - stages (Array<{label}>|null): when provided, renders the staged view.
 *  - currentStageIndex (number): index of the in-progress stage.
 */
export function ConversionModal({ isOpen, progress, message, stages, currentStageIndex = 0 }) {
  if (!isOpen) return null;

  const useStages = Array.isArray(stages) && stages.length > 0;
  const hasProgress = !useStages && progress != null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="theme-card rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl border" style={{ borderColor: 'var(--border-primary)' }}>
        <div className="flex flex-col items-center">

          {/* === Stages view (backend processing) === */}
          {useStages && (
            <>
              <h3 className="text-base font-semibold theme-text mb-5 self-center">
                Procesando kardex
              </h3>

              <ul className="self-stretch space-y-2.5 mb-5">
                {stages.map((stage, i) => {
                  const status = i < currentStageIndex ? 'done'
                               : i === currentStageIndex ? 'current'
                               : 'pending';
                  return (
                    <li key={i} className="flex items-center gap-3">
                      {status === 'done' && (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                          <CheckIcon className="w-3 h-3 text-white" />
                        </div>
                      )}
                      {status === 'current' && (
                        <div className="relative w-5 h-5 flex-shrink-0">
                          <div className="absolute inset-0 rounded-full border-2" style={{ borderColor: 'var(--border-primary)' }} />
                          <div className="absolute inset-0 rounded-full border-2 border-brand-blue border-t-transparent animate-spin" />
                        </div>
                      )}
                      {status === 'pending' && (
                        <div className="w-5 h-5 rounded-full border-2 flex-shrink-0" style={{ borderColor: 'var(--border-primary)' }} />
                      )}
                      <span className={`text-sm ${
                        status === 'current' ? 'font-semibold theme-text'
                        : status === 'done' ? 'theme-text-secondary'
                        : 'theme-text-tertiary'
                      }`}>
                        {stage.label}
                      </span>
                    </li>
                  );
                })}
              </ul>

              {/* Indeterminate animated bar — communicates "still working" without a fake percentage */}
              <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-1 overflow-hidden">
                <div className="bg-brand-blue h-1 rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>

              <p className="text-xs theme-text-tertiary text-center mt-4">
                Las transacciones blockchain pueden tardar hasta 1 minuto.<br />
                No cierres esta ventana.
              </p>
            </>
          )}

          {/* === Determinate progress (HTTP upload) === */}
          {hasProgress && (
            <>
              <div className="w-full mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium theme-text">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-brand-blue h-2.5 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <h3 className="text-lg font-semibold theme-text mb-1">Subiendo documentos</h3>
              <p className="text-sm theme-text-secondary text-center">
                {message || "Enviando archivos al servidor…"}
              </p>
            </>
          )}

          {/* === Indeterminate spinner (no progress info available) === */}
          {!useStages && !hasProgress && (
            <>
              <div className="relative mb-5">
                <div className="w-14 h-14 border-[3px] rounded-full" style={{ borderColor: 'var(--border-primary)' }}></div>
                <div className="absolute inset-0 w-14 h-14 border-[3px] border-brand-blue border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-lg font-semibold theme-text mb-1">Procesando</h3>
              <p className="text-sm theme-text-secondary text-center">
                {message || "Generando hash IPFS para tus documentos..."}
              </p>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
