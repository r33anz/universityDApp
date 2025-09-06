import React from "react";
import { Link } from "react-router-dom";
import { 
  UploadIcon, 
  NotificationsIcon, 
  InfoIcon, 
  CopyIcon 
} from "../../shared/components/Icons";

const AdminHomePage = () => {

  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
  const universityWallet = process.env.REACT_APP_WALLET_ADDRESS;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const truncateAddress = (address) => {
    if (!address) return "Dirección no configurada";
    return address;
  };

  return (
    <div className="flex flex-col items-center justify-start px-4 py-6"> 
      <div className="text-center max-w-4xl w-full mb-6"> 
        <h1 className="text-3xl font-bold text-[#184494ff] mb-2"> 
          Panel de Administración
        </h1>
        <p className="text-md text-gray-600 mb-6"> 
          Gestión integral de kardex académico mediante blockchain
        </p>
      </div>


      <div className="grid md:grid-cols-2 gap-4 max-w-4xl w-full"> 
        {/* Card para subida de archivos */}
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100"> 
          <h2 className="text-xl font-semibold text-[#184494ff] mb-2 flex items-center gap-2"> 
            <UploadIcon className="w-5 h-5" /> 
            Carga de Kardex
          </h2>
          <p className="text-sm text-gray-600 mb-2"> 
            Sube el kardex estudiantil en formato JSON. El sistema verificará que el código SIS del estudiante coincida con el registrado en el kardex antes de proceder con la carga.
          </p>
          <ul className="text-xs text-gray-500 mb-4 pl-4 list-disc">
            <li>Formato aceptado: JSON</li>
            <li>Validación automática de código SIS</li>
            <li>Registro en blockchain tras validación</li>
          </ul>
          <Link
            to="/administracion/manejo_archivo"
            className="inline-block w-full bg-[#088404] text-white py-2 px-4 rounded-lg text-sm text-center" 
          >
            Ir a Carga de Archivos
          </Link>
        </div>

        {/* Card para notificaciones */}
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100"> 
          <h2 className="text-xl font-semibold text-[#184494ff] mb-2 flex items-center gap-2"> 
            <NotificationsIcon className="w-5 h-5" /> 
            Solicitudes de Kardex
          </h2>
          <p className="text-sm text-gray-600 mb-2"> 
            Gestiona las notificaciones y solicitudes de kardex. El sistema enviará mensajes al email del websis solicitando los kardex de los estudiantes que lo requieran.
          </p>
          <ul className="text-xs text-gray-500 mb-4 pl-4 list-disc">
            <li>Gestión de solicitudes entrantes</li>
            <li>Notificaciones por correo electrónico</li>
            <li>Seguimiento de solicitudes pendientes</li>
          </ul>
          <Link
            to="/administracion/notificaciones"
            className="inline-block w-full bg-[#088404] text-white py-2 px-4 rounded-lg text-sm text-center" 
          >
            Gestionar Solicitudes
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminHomePage;