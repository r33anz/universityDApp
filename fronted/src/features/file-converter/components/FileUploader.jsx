import React, { useState, useRef } from "react";
import { UploadIcon } from "../../../shared/components/Icons";

export function FileUploader({ onFileUpload, onError }) {
    const [isDragging, setIsDragging] = useState(false);
    const [fileName, setFileName] = useState(null);
    const inputRef = useRef(null);

    const processFile = (file) => {
      if (!file) return;

      const isValid = file.type === "application/json" ||
                      file.name.toLowerCase().endsWith('.json');

      if (isValid) {
        setFileName(file.name);
        onFileUpload(file);
      } else {
        setFileName(null);
        if (inputRef.current) inputRef.current.value = '';
        onError(new Error("FORMATO_INVALIDO"));
      }
    };

    const handleChange = (e) => {
      processFile(e.target.files[0]);
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      setIsDragging(true);
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      setIsDragging(false);
    };

    const handleDrop = (e) => {
      e.preventDefault();
      setIsDragging(false);
      processFile(e.dataTransfer.files[0]);
    };

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-brand-blue dark:text-blue-300 mb-2">
              Carga de Kardex
            </h2>
            <p className="theme-text-secondary">
              Sube el archivo JSON del kardex estudiantil para generar los documentos PDF
            </p>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
              isDragging
                ? "border-brand-blue bg-brand-blue/5 dark:bg-brand-blue/10 scale-[1.02]"
                : fileName
                  ? "border-brand-teal bg-brand-teal/5 dark:bg-brand-teal/10"
                  : "border-[var(--border-primary)] theme-card hover:border-brand-blue/50 hover:bg-brand-blue/5 dark:hover:bg-brand-blue/10"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".json"
              onChange={handleChange}
              className="hidden"
              id="json-upload"
            />

            <div className="flex flex-col items-center space-y-4">
              <div className={`p-4 rounded-2xl transition-colors duration-300 ${
                isDragging
                  ? "bg-brand-blue/10 dark:bg-brand-blue/20"
                  : fileName
                    ? "bg-brand-teal/10 dark:bg-brand-teal/20"
                    : "theme-muted"
              }`}>
                <UploadIcon className={`h-10 w-10 transition-colors duration-300 ${
                  isDragging
                    ? "text-brand-blue"
                    : fileName
                      ? "text-brand-teal"
                      : "theme-text-tertiary"
                }`} />
              </div>

              {fileName ? (
                <>
                  <div className="flex items-center space-x-2 text-brand-teal">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="font-medium">{fileName}</span>
                  </div>
                  <p className="text-sm theme-text-tertiary">Clic o arrastra otro archivo para reemplazar</p>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-lg font-medium theme-text">
                      {isDragging ? "Suelta el archivo aqui" : "Arrastra tu archivo JSON aqui"}
                    </p>
                    <p className="text-sm theme-text-tertiary mt-1">
                      o <span className="text-brand-blue dark:text-blue-300 font-medium">haz clic para seleccionar</span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-4 text-xs theme-text-tertiary">
                    <span className="flex items-center space-x-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                      </svg>
                      <span>Solo .json</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                      </svg>
                      <span>Formato kardex UMSS</span>
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
}
