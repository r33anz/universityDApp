import React, { useState, useMemo, useEffect, useRef } from 'react';
import { FileUploader } from './components/FileUploader';
import { PdfViewer } from './components/PdfViewer';
import { ConversionModal } from './components/ConversionModal';
import { uploadMultiplePdfsWithSisCode } from './service/pdfService';
import { getApiErrorMessage } from '../../shared/lib/apiError';
import { useToastContext } from '../../shared/providers/ToastProvider';
import { Stepper } from '../../shared/components/Stepper';
import { useUploadHistory, formatRelativeTime } from './hooks/useUploadHistory';
import {
  CheckCircleIcon,
  XIcon,
  ClockIcon,
  UploadIcon,
  SearchIcon,
} from '../../shared/components/Icons';

const STEPS = ['Cargar', 'Revisar', 'Completado'];

/**
 * Stages of the kardex registration flow. Frontend advances through them on
 * timers that approximate real backend timings. The HTTP request itself doesn't
 * report stage-level progress (it only knows about the upload bytes), so we
 * simulate honestly: every label corresponds to actual server-side work.
 */
const KARDEX_STAGES = [
  { label: 'Procesando documentos PDF',          duration: 3000  },
  { label: 'Subiendo a almacenamiento IPFS',     duration: 7000  },
  { label: 'Registrando en blockchain',          duration: 15000 },
  { label: 'Confirmando transacción on-chain',   duration: null  }, // holds until response
];


function FileConverterPage() {
  const [isConverting, setIsConverting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [convertingMessage, setConvertingMessage] = useState('');
  const [stageIdx, setStageIdx] = useState(0);
  const [inProcessingPhase, setInProcessingPhase] = useState(false);
  const [step, setStep] = useState(1);
  const [PdfFiles, setPdfFiles] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [reviewedSet, setReviewedSet] = useState(() => new Set());
  const [search, setSearch] = useState('');
  const toast = useToastContext();
  const { history, addEntry } = useUploadHistory();

  // When the HTTP upload hits 100%, switch the modal to "backend processing"
  // mode so the user stops staring at a fake 100% while the chain confirms.
  useEffect(() => {
    if (uploadProgress === 100 && !inProcessingPhase) {
      setInProcessingPhase(true);
      setStageIdx(0);
    }
  }, [uploadProgress, inProcessingPhase]);

  // Advance the simulated stages on timers while in processing phase. The last
  // stage has no duration — it holds until the real HTTP response arrives.
  useEffect(() => {
    if (!inProcessingPhase) return;
    const stage = KARDEX_STAGES[stageIdx];
    if (!stage || !stage.duration) return;
    const t = setTimeout(() => setStageIdx((i) => Math.min(i + 1, KARDEX_STAGES.length - 1)), stage.duration);
    return () => clearTimeout(t);
  }, [inProcessingPhase, stageIdx]);

  const pdfsByCareer = useMemo(() => {
    if (PdfFiles.length === 0) return {};
    const filtered = search.trim()
      ? PdfFiles.filter((p) => p.subject?.toLowerCase().includes(search.trim().toLowerCase()))
      : PdfFiles;
    return filtered.reduce((acc, pdf) => {
      if (!acc[pdf.career]) acc[pdf.career] = [];
      acc[pdf.career].push(pdf);
      return acc;
    }, {});
  }, [PdfFiles, search]);

  // Mark current pdf as reviewed whenever the selection changes.
  useEffect(() => {
    if (!selectedPdf?.filename) return;
    setReviewedSet((prev) => {
      if (prev.has(selectedPdf.filename)) return prev;
      const next = new Set(prev);
      next.add(selectedPdf.filename);
      return next;
    });
  }, [selectedPdf]);

  const currentIndex = selectedPdf ? PdfFiles.findIndex((p) => p.filename === selectedPdf.filename) : -1;
  const handlePrev = () => currentIndex > 0 && setSelectedPdf(PdfFiles[currentIndex - 1]);
  const handleNext = () => currentIndex >= 0 && currentIndex < PdfFiles.length - 1 && setSelectedPdf(PdfFiles[currentIndex + 1]);
  const reviewedCount = reviewedSet.size;

  // Keyboard nav: ← → between PDFs while reviewing. Don't hijack typing.
  useEffect(() => {
    if (step !== 2) return;
    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return;
      if (e.key === 'ArrowLeft')  { e.preventDefault(); handlePrev(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); handleNext(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step, currentIndex, PdfFiles.length]);

  const pdfFilesRef = useRef(PdfFiles);
  pdfFilesRef.current = PdfFiles;
  useEffect(() => {
    return () => {
      pdfFilesRef.current.forEach(pdf => { if (pdf.url) URL.revokeObjectURL(pdf.url); });
    };
  }, []);

  const handleFileError = (error) => {
    const msg = error.message || "";
    if (msg === "FORMATO_INVALIDO") {
      toast.error("Debe subir un archivo en formato JSON válido (.json)");
    } else {
      toast.error(`Error: ${msg || "Error desconocido"}`);
    }
  };

  const handleFileUpload = async (file) => {
    setIsConverting(true);
    setConvertingMessage('Leyendo y validando archivo JSON...');
    try {
      const { generateIndividualPdfs } = await import('./service/jsonToPdf');
      const { individualPdfs, sisCode, studentName } = await generateIndividualPdfs(file);
      setStudentInfo({ name: studentName, sisCode });
      const pdfsWithUrls = individualPdfs.map(pdf => ({
        ...pdf,
        url: URL.createObjectURL(pdf.blob)
      }));
      setPdfFiles(pdfsWithUrls);
      setSelectedPdf(pdfsWithUrls[0]);
      setStep(2);
    } catch (error) {
      const msg = error.message || "";
      const errorMap = {
        "FORMATO_INVALIDO": "Debe subir un archivo en formato JSON válido (.json)",
        "Faltan campos requeridos": `Error en el formato: ${msg}`,
        "El campo 'Carrera(s)'": "El formato de carreras en el JSON no es válido",
        "El archivo JSON está vacío": "El archivo seleccionado está vacío",
        "No se generaron PDFs": "El archivo no contiene materias válidas para procesar",
        "Error al leer el archivo": "No se pudo leer el archivo. Puede estar corrupto",
      };
      const match = Object.keys(errorMap).find(key => msg.includes(key));
      toast.error(match ? errorMap[match] : `Error al procesar el archivo: ${msg || "Error desconocido"}`);
    } finally {
      setIsConverting(false);
      setConvertingMessage('');
    }
  };

  const handleSubmit = async () => {
    try {
      setIsConverting(true);
      setConvertingMessage('Registrando documentos en blockchain...');
      setUploadProgress(0);

      const response = await uploadMultiplePdfsWithSisCode(
        PdfFiles,
        studentInfo.sisCode,
        studentInfo.name,
        { onProgress: setUploadProgress }
      );

      PdfFiles.forEach(pdf => URL.revokeObjectURL(pdf.url));

      addEntry({
        sisCode: studentInfo.sisCode,
        studentName: studentInfo.name,
        documentCount: PdfFiles.length,
        careers: Object.keys(pdfsByCareer),
        status: 'success'
      });

      setUploadResult({
        success: true,
        message: response.message || 'Documentos registrados exitosamente en blockchain'
      });
      setStep(3);
    } catch (error) {
      setUploadResult({
        success: false,
        message: error.message === "SIS_MISMATCH"
          ? "El código SIS no coincide con el del kardex."
          : getApiErrorMessage(error)
      });
      setStep(3);
    } finally {
      setIsConverting(false);
      setConvertingMessage('');
      setUploadProgress(null);
      setInProcessingPhase(false);
      setStageIdx(0);
    }
  };

  const handleReset = () => {
    PdfFiles.forEach(pdf => { if (pdf.url) URL.revokeObjectURL(pdf.url); });
    setPdfFiles([]);
    setSelectedPdf(null);
    setStudentInfo(null);
    setConfirmed(false);
    setUploadResult(null);
    setReviewedSet(new Set());
    setSearch('');
    setStep(1);
  };

  const handleRetry = () => {
    setUploadResult(null);
    setUploadProgress(null);
    setStep(2);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <Stepper steps={STEPS} currentStep={step} />

      {/* Paso 1: Cargar archivo */}
      {step === 1 && (
        <>
          <FileUploader onFileUpload={handleFileUpload} onError={handleFileError} />

          {history.length > 0 && (
            <div className="max-w-xl mx-auto mt-8">
              <h3 className="text-sm font-semibold theme-text-secondary mb-3 flex items-center gap-2">
                <ClockIcon width="14" height="14" className="theme-text-tertiary" />
                Cargas recientes
              </h3>
              <div className="theme-card rounded-xl border overflow-hidden divide-y" style={{ borderColor: 'var(--border-primary)' }}>
                {history.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="px-4 py-3 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-brand-teal/10 dark:bg-brand-teal/20 flex items-center justify-center flex-shrink-0">
                        <CheckCircleIcon className="w-3.5 h-3.5 text-brand-teal" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium theme-text truncate">{entry.studentName}</p>
                        <p className="text-xs theme-text-tertiary">SIS {entry.sisCode} · {entry.documentCount} docs</p>
                      </div>
                    </div>
                    <span className="text-xs theme-text-tertiary flex-shrink-0 ml-3">{formatRelativeTime(entry.timestamp)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Paso 2: Revisar y confirmar */}
      {step === 2 && PdfFiles.length > 0 && studentInfo && (
        <div className="flex flex-col" style={{ height: 'calc(100vh - 230px)' }}>
          {/* Banner de estudiante — una sola línea, sin peso visual */}
          <div className="mb-3 px-4 py-2.5 rounded-xl theme-card border flex items-center justify-between gap-4 flex-wrap" style={{ borderColor: 'var(--border-primary)' }}>
            <div className="flex items-baseline gap-2 min-w-0 flex-1">
              <h2 className="font-semibold theme-text truncate">{studentInfo.name}</h2>
              <span className="theme-text-tertiary">·</span>
              <span className="text-sm theme-text-secondary flex-shrink-0">
                SIS <span className="font-mono font-medium text-brand-blue dark:text-blue-300">{studentInfo.sisCode}</span>
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs theme-text-secondary flex-shrink-0">
              <span>{Object.keys(pdfsByCareer).length} {Object.keys(pdfsByCareer).length === 1 ? 'carrera' : 'carreras'}</span>
              <span className="theme-text-tertiary/60">·</span>
              <span>{PdfFiles.length} {PdfFiles.length === 1 ? 'documento' : 'documentos'}</span>
            </div>
          </div>

          {/* Sidebar + Preview */}
          <div className="flex flex-1 gap-4 min-h-0">
            <div className="w-72 flex-shrink-0 theme-card rounded-xl shadow-sm border flex flex-col overflow-hidden" style={{ borderColor: 'var(--border-primary)' }}>
              <div className="px-4 py-2.5 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold theme-text">Materias</h3>
                  <span className={`text-xs font-medium tabular-nums ${
                    reviewedCount === PdfFiles.length
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'theme-text-tertiary'
                  }`}>
                    {reviewedCount}/{PdfFiles.length} revisadas
                  </span>
                </div>
                {PdfFiles.length >= 5 && (
                  <div className="relative mt-2">
                    <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 theme-text-tertiary" />
                    <input
                      type="text"
                      placeholder="Buscar materia…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-8 pr-2 py-1.5 text-xs rounded-md border theme-text focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
                      style={{ backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-primary)' }}
                    />
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                {Object.entries(pdfsByCareer).length === 0 && (
                  <p className="text-xs theme-text-tertiary px-3 py-6 text-center">Sin resultados para "{search}"</p>
                )}
                {Object.entries(pdfsByCareer).map(([career, careerPdfs]) => (
                  <div key={career} className="mb-3">
                    <h4 className="text-[10px] font-bold theme-text-tertiary uppercase tracking-widest px-2 mb-1.5">
                      {career} <span className="theme-text-tertiary/70">({careerPdfs.length})</span>
                    </h4>
                    <ul className="space-y-1">
                      {careerPdfs.map((pdf, index) => {
                        const isSelected = selectedPdf?.filename === pdf.filename;
                        const wasReviewed = reviewedSet.has(pdf.filename);
                        return (
                          <li key={index} className="relative">
                            {isSelected && (
                              <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-brand-blue" />
                            )}
                            <button
                              type="button"
                              onClick={() => setSelectedPdf(pdf)}
                              className={`w-full text-left rounded-lg transition-all px-3 py-2 flex items-center justify-between gap-2 ${
                                isSelected
                                  ? 'bg-brand-blue/10 dark:bg-brand-blue/20 pl-4'
                                  : 'hover:bg-black/5 dark:hover:bg-white/5'
                              }`}
                            >
                              <p className={`text-sm leading-snug truncate ${
                                isSelected
                                  ? 'font-semibold text-brand-blue dark:text-blue-300'
                                  : 'font-medium theme-text'
                              }`}>
                                {pdf.subject}
                              </p>
                              {wasReviewed && !isSelected && (
                                <CheckCircleIcon className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-hidden rounded-xl shadow-sm border theme-card" style={{ borderColor: 'var(--border-primary)' }}>
              <PdfViewer
                file={selectedPdf?.url}
                fileName={selectedPdf?.subject}
                career={selectedPdf?.career}
                metadata={{ gestion: selectedPdf?.gestion, nota: selectedPdf?.nota, creditos: selectedPdf?.creditos }}
                currentIndex={currentIndex}
                totalCount={PdfFiles.length}
                onPrev={handlePrev}
                onNext={handleNext}
              />
            </div>
          </div>

          {/* Footer de confirmación — esbelto, una sola línea */}
          <div className="mt-3 px-4 py-2.5 rounded-xl theme-card border flex items-center justify-between gap-3" style={{ borderColor: 'var(--border-primary)' }}>
            <label className="flex items-center gap-2.5 cursor-pointer group flex-1 min-w-0">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="h-4 w-4 flex-shrink-0 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
              />
              <span className="text-sm theme-text group-hover:text-brand-blue dark:group-hover:text-blue-300 transition-colors truncate">
                Confirmo que el kardex corresponde a <strong>{studentInfo.name}</strong>
              </span>
            </label>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleReset}
                className="px-3 py-1.5 text-sm theme-text-secondary hover:theme-text transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={!confirmed}
                className="px-4 py-1.5 text-sm font-medium text-white bg-brand-blue rounded-lg hover:bg-brand-blue/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <UploadIcon className="w-3.5 h-3.5" />
                Confirmar y registrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paso 3: Resultado */}
      {step === 3 && uploadResult && (
        <div className="flex flex-col items-center justify-center py-16 max-w-lg mx-auto">
          {uploadResult.success ? (
            <>
              <div className="w-16 h-16 bg-brand-teal/10 dark:bg-brand-teal/20 rounded-full flex items-center justify-center mb-5">
                <CheckCircleIcon className="w-8 h-8 text-brand-teal" />
              </div>
              <h2 className="text-xl font-bold theme-text mb-2">Kardex registrado exitosamente</h2>
              <p className="text-sm theme-text-secondary text-center mb-2">{uploadResult.message}</p>
              {studentInfo && (
                <div className="theme-muted rounded-xl p-4 w-full mt-4 mb-6">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="theme-text-tertiary text-xs">Estudiante</p>
                      <p className="font-medium theme-text">{studentInfo.name}</p>
                    </div>
                    <div>
                      <p className="theme-text-tertiary text-xs">Código SIS</p>
                      <p className="font-medium theme-text font-mono">{studentInfo.sisCode}</p>
                    </div>
                    <div>
                      <p className="theme-text-tertiary text-xs">Documentos</p>
                      <p className="font-medium theme-text">{PdfFiles.length}</p>
                    </div>
                    <div>
                      <p className="theme-text-tertiary text-xs">Carreras</p>
                      <p className="font-medium theme-text">{Object.keys(pdfsByCareer).join(', ')}</p>
                    </div>
                  </div>
                </div>
              )}
              <button
                onClick={handleReset}
                className="w-full px-6 py-3 bg-brand-blue text-white rounded-lg text-sm font-medium hover:bg-brand-blue/90 transition-colors"
              >
                Cargar otro kardex
              </button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-brand-red/10 dark:bg-brand-red/20 rounded-full flex items-center justify-center mb-5">
                <XIcon className="w-8 h-8 text-brand-red" />
              </div>
              <h2 className="text-xl font-bold theme-text mb-2">Error al registrar</h2>
              <p className="text-sm theme-text-secondary text-center mb-6">{uploadResult.message}</p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={handleRetry}
                  className="flex-1 px-4 py-3 bg-brand-blue text-white rounded-lg text-sm font-medium hover:bg-brand-blue/90 transition-colors"
                >
                  Intentar de nuevo
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-3 theme-card border rounded-lg text-sm font-medium theme-text-secondary hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  style={{ borderColor: 'var(--border-primary)' }}
                >
                  Cargar otro archivo
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <ConversionModal
        isOpen={isConverting}
        progress={inProcessingPhase ? null : uploadProgress}
        message={convertingMessage}
        stages={inProcessingPhase ? KARDEX_STAGES : null}
        currentStageIndex={stageIdx}
      />
    </div>
  );
}

export default FileConverterPage;
