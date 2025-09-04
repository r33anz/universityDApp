import React, { useState, useEffect } from 'react';
import { EventCard } from './components/EventCard';
import { EventListenerService } from './service/EventLsitenerService';
import { Button } from '../../shared/components/Button';

const ContractEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [isListening, setIsListening] = useState(false);

  const contractAddress = '0xTU_PROXY_ADDRESS'; // Reemplaza con la dirección del proxy
  const rpcUrl = 'https://data-seed-prebsc-1-s1.binance.org:8545/';
  const fromBlock = 64117849; // Bloque de despliegue del proxy
  const eventListenerService = new EventListenerService();

  // Inicializar provider y contrato
  useEffect(() => {
    const init = async () => {
      try {
        eventListenerService.initializeProvider(rpcUrl);
        eventListenerService.setupContract(contractAddress);
        await fetchEvents();
      } catch (err) {
        setError(err.message);
      }
    };
    init();
  }, []);

  // Fetch eventos históricos
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const newEvents = await eventListenerService.getContractEvents(fromBlock);
      setEvents(newEvents);
      setFilteredEvents(newEvents);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar eventos
  useEffect(() => {
    setFilteredEvents(
      filter === 'all'
        ? events
        : events.filter(event => event.eventName === filter)
    );
  }, [filter, events]);

  // Iniciar/detener listener en tiempo real
  const toggleRealTimeListening = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      const stopListener = eventListenerService.listenToEvents(event => {
        setEvents(prev => [event, ...prev]);
      });
      return stopListener; // Se ejecuta al desmontar
    }
  };

  // Limpiar listener al desmontar
  useEffect(() => {
    return () => {
      if (isListening) {
        eventListenerService.listenToEvents(() => {}); // Dummy callback para limpiar
      }
    };
  }, [isListening]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#184494ff]">
            Eventos del Contrato Inteligente
          </h1>
          <Button
            onClick={toggleRealTimeListening}
            className={isListening ? 'bg-red-500 text-white' : 'bg-[#184494ff] text-white'}
          >
            {isListening ? 'Detener Escucha' : 'Escuchar en Tiempo Real'}
          </Button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-[#184494ff] mb-4">Filtrar Eventos</h2>
          <div className="flex flex-wrap gap-3">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'bg-[#184494ff] text-white' : ''}
            >
              Todos los Eventos
            </Button>
            <Button
              variant={filter === 'RequestKardex' ? 'default' : 'outline'}
              onClick={() => setFilter('RequestKardex')}
              className={filter === 'RequestKardex' ? 'bg-[#184494ff] text-white' : ''}
            >
              RequestKardex
            </Button>
            <Button
              variant={filter === 'CredentialIssued' ? 'default' : 'outline'}
              onClick={() => setFilter('CredentialIssued')}
              className={filter === 'CredentialIssued' ? 'bg-[#184494ff] text-white' : ''}
            >
              CredentialIssued
            </Button>
          </div>
        </div>

        {/* Resultados */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-[#184494ff] mb-4">
            Resultados ({filteredEvents.length} eventos)
          </h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#184494ff] mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando eventos...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>{error}</p>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="space-y-4">
              {filteredEvents.map((event, index) => (
                <EventCard
                  key={`${event.transactionHash}-${event.logIndex}-${index}`}
                  event={event}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No se encontraron eventos.</p>
              <p className="text-sm">Verifica la dirección del contrato o el rango de bloques.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractEventsPage;