import React from "react";

export function SubmitForm({ sisCode, setSisCode, onSubmit, compact }) {
    return (
      <form onSubmit={onSubmit} className={compact ? "space-y-2" : "space-y-4"}>
        <div>
          <label htmlFor="sis-code" className="block text-sm font-medium theme-text-secondary mb-1">
            Codigo SIS
          </label>
          <input
            type="text"
            id="sis-code"
            value={sisCode}
            onChange={(e) => setSisCode(e.target.value)}
            placeholder="Ej: 201900000"
            className="block w-full rounded-lg py-2 px-3 text-sm transition-colors theme-text border focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
            style={{ backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-primary)' }}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-brand-blue hover:bg-brand-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Enviar Documento
        </button>
      </form>
    );
}
