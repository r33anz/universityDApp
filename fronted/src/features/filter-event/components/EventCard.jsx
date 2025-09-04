import React, { useState } from 'react';

export const EventCard = ({ event }) => {
  const [showRawData, setShowRawData] = useState(false);

  const formatTimestamp = (timestamp) =>
    timestamp ? new Date(timestamp * 1000).toLocaleString('es-ES') : 'N/A';

  const getEventBadgeColor = (eventName) => {
    return eventName === 'RequestKardex'
      ? 'bg-blue-100 text-blue-800 border-blue-200'
      : eventName === 'CredentialIssued'
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatAddress = (address) =>
    address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'N/A';

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-4 hover:shadow-lg transition-shadow duration-200">
      <div className="p-4 border-b border-gray-100">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getEventBadgeColor(event.eventName)}`}>
              {event.eventName}
            </span>
            <span className="text-sm text-gray-500">Bloque #{event.blockNumber}</span>
          </div>
          <span className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
            {formatTimestamp(event.timestamp)}
          </span>
        </div>
        <div className="flex gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Hash TX:</span>
            <span className="ml-1 font-mono">{formatAddress(event.transactionHash)}</span>
          </div>
          <div>
            <span className="font-medium">Log Index:</span>
            <span className="ml-1">{event.logIndex}</span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Datos del Evento:</h4>
        <div className="bg-gray-50 p-3 rounded-md space-y-2">
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Código SIS:</span>
            <span className="text-gray-900 font-mono">{event.args.codSIS || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Wallet:</span>
            <span className="text-gray-900 font-mono text-sm">{formatAddress(event.args.wallet)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">{event.eventName === 'RequestKardex' ? 'Tiempo Solicitado' : 'Emitido en'}:</span>
            <span className="text-gray-900">{formatTimestamp(event.args.time)}</span>
          </div>
        </div>
        <div className="flex justify-end mt-3">
          <button
            onClick={() => setShowRawData(!showRawData)}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            {showRawData ? 'Ocultar Raw Data' : 'Ver Raw Data'}
          </button>
        </div>
        {showRawData && (
          <div className="mt-3 border-t pt-3">
            <h5 className="text-xs font-medium text-gray-700 mb-2">Datos Sin Procesar:</h5>
            <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
              <pre>{JSON.stringify(event, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};