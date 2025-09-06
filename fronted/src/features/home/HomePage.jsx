import React from "react";
import { Link } from "react-router-dom";
import { 
  EyeIcon, 
  ShieldIcon, 
  InfoIcon, 
  CopyIcon } from "../../shared/components/Icons";

const HomePage = () => {

  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
  const universityWallet = process.env.REACT_APP_WALLET_ADDRESS;
  const nftAddress =  process.env.REACT_APP_NFT_ADDRESS;
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const truncateAddress = (address) => {
    if (!address) return "Dirección no configurada";
    // Mostrar primeros y últimos 6 caracteres para mejor legibilidad
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="flex flex-col items-center justify-start px-4 py-6"> 
      <div className="text-center max-w-4xl w-full mb-6"> 
        <h1 className="text-3xl font-bold text-[#184494ff] mb-2"> 
          Bienvenido a transferKardex
        </h1>
        <p className="text-md text-gray-600 mb-6"> 
          Sistema blockchain para la gestión de kardex académico
        </p>
      </div>

      {/* Contenedor de contratos en fila horizontal */}
      <div className="grid md:grid-cols-3 gap-4 w-full max-w-6xl mb-8"> 
        
        {/* Wallet Institucional */}
        <div className="bg-blue-50 p-4 rounded-xl border border-gray-200"> 
          <div className="flex items-center gap-2 mb-2"> 
            <div className="p-1 bg-blue-100 rounded-full">
              <InfoIcon className="text-blue-600 w-4 h-4" /> 
            </div>
            <h3 className="font-medium text-blue-800 text-sm"> 
              Wallet Institucional
            </h3>
          </div>
          
          <div className="bg-white p-2 rounded-lg border border-gray-200 mb-2"> 
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs" title={universityWallet}>
                {truncateAddress(universityWallet)}
              </p>
              <button 
                onClick={() => copyToClipboard(universityWallet)}
                className="text-gray-500 hover:text-blue-600 ml-1 p-1 rounded hover:bg-blue-50"
              >
                <CopyIcon className="w-3 h-3" /> 
              </button>
            </div>
          </div>
        </div>

        {/* Contrato de manejo de credenciales */}
        <div className="bg-blue-50 p-4 rounded-xl border border-gray-200"> 
          <div className="flex items-center gap-2 mb-2"> 
            <div className="p-1 bg-blue-100 rounded-full">
              <InfoIcon className="text-blue-600 w-4 h-4" /> 
            </div>
            <h3 className="font-medium text-blue-800 text-sm"> 
              Contrato de Credenciales
            </h3>
          </div>
          
          <div className="bg-white p-2 rounded-lg border border-gray-200 mb-2"> 
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs" title={contractAddress}>
                {truncateAddress(contractAddress)}
              </p>
              <button 
                onClick={() => copyToClipboard(contractAddress)}
                className="text-gray-500 hover:text-blue-600 ml-1 p-1 rounded hover:bg-blue-50"
              >
                <CopyIcon className="w-3 h-3" /> 
              </button>
            </div>
          </div>
        </div>

        {/* Contrato NFT */}
        <div className="bg-blue-50 p-4 rounded-xl border border-gray-200"> 
          <div className="flex items-center gap-2 mb-2"> 
            <div className="p-1 bg-blue-100 rounded-full">
              <InfoIcon className="text-blue-600 w-4 h-4" /> 
            </div>
            <h3 className="font-medium text-blue-800 text-sm"> 
              Contrato NFT
            </h3>
          </div>
          
          <div className="bg-white p-2 rounded-lg border border-gray-200 mb-2"> 
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs" title={nftAddress}>
                {truncateAddress(nftAddress)}
              </p>
              <button 
                onClick={() => copyToClipboard(nftAddress)}
                className="text-gray-500 hover:text-blue-600 ml-1 p-1 rounded hover:bg-blue-50"
              >
                <CopyIcon className="w-3 h-3" /> 
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjetas de acceso */}
      <div className="grid md:grid-cols-2 gap-4 max-w-4xl w-full"> 
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100"> 
          <h2 className="text-xl font-semibold text-[#184494ff] mb-2 flex items-center gap-2"> 
            <EyeIcon className="w-5 h-5" /> 
            Estudiantes
          </h2>
          <p className="text-sm text-gray-600 mb-4"> 
            Accede a tu kardex académico de forma segura.
          </p>
          <Link
            to="/estudiante"
            className="inline-block w-full bg-[#088404] text-white py-2 px-4 rounded-lg text-sm text-center" 
          >
            Acceder
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow p-6 border border-gray-100"> 
          <h2 className="text-xl font-semibold text-[#184494ff] mb-2 flex items-center gap-2"> 
            <ShieldIcon className="w-5 h-5" /> 
            Administración
          </h2>
          <p className="text-sm text-gray-600 mb-4"> 
            Gestiona calificaciones de estudiantes.
          </p>
          <Link
            to="/administracion"
            className="inline-block w-full bg-[#088404] text-white py-2 px-4 rounded-lg text-sm text-center" 
          >
            Acceder
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;