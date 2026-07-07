import React, { useState } from "react";
import { XIcon, FileTextIcon } from "../../../shared/components/Icons";

// Inline chevron icons (lightweight, no extra import).
const ChevronLeft = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const ChevronRight = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const gradeTone = (nota) => {
  const n = Number(nota);
  if (Number.isNaN(n)) return "text-gray-500";
  if (n >= 90) return "text-emerald-600 dark:text-emerald-400";
  if (n >= 80) return "text-brand-blue dark:text-blue-300";
  if (n >= 70) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
};

export function PdfViewer({
  file,
  fileName,
  career,
  metadata,
  currentIndex,
  totalCount,
  onPrev,
  onNext,
}) {
  const [error, setError] = useState(false);
  const canNavigate = typeof currentIndex === "number" && totalCount > 0;
  const canPrev = canNavigate && currentIndex > 0;
  const canNext = canNavigate && currentIndex < totalCount - 1;

  const hasMeta = metadata && (metadata.nota != null || metadata.creditos != null || metadata.gestion);

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-2.5 border-b theme-muted" style={{ borderColor: "var(--border-primary)" }}>
        {/* Una sola fila: título + meta inline + nav */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-brand-blue dark:text-blue-300 text-sm leading-tight truncate">
              {fileName || "Vista previa"}
            </h3>
            <div className="flex items-baseline gap-1.5 mt-0.5 text-xs theme-text-tertiary truncate">
              {career && <span className="truncate">{career}</span>}
              {hasMeta && career && <span>·</span>}
              {hasMeta && (
                <span className="truncate">
                  {metadata.nota != null && (
                    <>Nota <span className={`font-semibold ${gradeTone(metadata.nota)}`}>{metadata.nota}</span></>
                  )}
                  {metadata.creditos != null && (
                    <> · {metadata.creditos} créditos</>
                  )}
                  {metadata.gestion && (
                    <> · {metadata.gestion}</>
                  )}
                </span>
              )}
            </div>
          </div>

          {canNavigate && (
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={onPrev}
                disabled={!canPrev}
                aria-label="Materia anterior"
                className="p-1 rounded-md disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 theme-text-secondary" />
              </button>
              <span className="text-xs theme-text-tertiary font-medium tabular-nums px-1">
                {currentIndex + 1}/{totalCount}
              </span>
              <button
                type="button"
                onClick={onNext}
                disabled={!canNext}
                aria-label="Siguiente materia"
                className="p-1 rounded-md disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <ChevronRight className="w-4 h-4 theme-text-secondary" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1" style={{ backgroundColor: "var(--bg-muted)" }}>
        {file && !error ? (
          <iframe src={`${file}#toolbar=0&navpanes=0`} className="w-full h-full" title="PDF Preview" onError={() => setError(true)} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8">
            {error ? (
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-brand-red/10 flex items-center justify-center">
                  <XIcon className="w-5 h-5 text-brand-red" />
                </div>
                <p className="text-sm theme-text-secondary mb-2">Error al cargar el PDF</p>
                <a href={file} download={fileName || "documento.pdf"} className="text-sm text-brand-blue dark:text-blue-300 hover:underline">
                  Descargar archivo
                </a>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl theme-elevated flex items-center justify-center">
                  <FileTextIcon className="w-7 h-7 theme-text-tertiary" />
                </div>
                <p className="text-sm theme-text-secondary">Selecciona un documento de la lista</p>
                <p className="text-xs theme-text-tertiary mt-1">para ver la vista previa</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
