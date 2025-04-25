import React from "react";

export function SubmitForm({ sisCode, setSisCode, onSubmit }) {
    return (
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="sis-code" className="block text-sm font-medium text-gray-700">
            Código SIS
          </label>
          <input
            type="text"
            id="sis-code"
            value={sisCode}
            onChange={(e) => setSisCode(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Enviar Documento
          </button>
        </div>
      </form>
    );
  }