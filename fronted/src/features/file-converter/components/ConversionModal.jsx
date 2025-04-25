import React from "react";

export function ConversionModal({ isOpen }) {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900">Subiendo el archivo a IPFS</h3>
            <p className="mt-2 text-sm text-gray-500">Por favor espera mientras generamos su hash IPFS</p>
          </div>
        </div>
      </div>
    );
  }