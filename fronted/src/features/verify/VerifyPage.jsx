import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  SearchIcon, 
  CheckIcon, 
  XIcon, 
  InfoIcon,
  ExternalLinkIcon
} from "../../shared/components/Icons";
import { verifyStudentByWallet } from "./verifyService";

const VerifyPage = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState("");

  const verifyStudent = async (address) => {
    setIsLoading(true);
    setError("");
    
    try {
      const response = await verifyStudentByWallet(address);
      
      if (response.success) {
        setVerificationResult(response.data);
      } else {
        setError(response.message || "Error en la verificación");
      }
    } catch (err) {
      setError(err.message || "Error al verificar la dirección. Por favor, inténtelo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!walletAddress.trim()) {
      setError("Por favor, ingrese una dirección de wallet");
      return;
    }
    
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!ethAddressRegex.test(walletAddress)) {
      setError("Por favor, ingrese una dirección de wallet válida");
      return;
    }
    
    verifyStudent(walletAddress);
  };

  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS_PROXY_MANAGEMENT_CREDENTIAL || "0x07F751090e3f279CC7CEd7306C1B0d6949cc9d64";
  const bscScanBaseUrl = "https://testnet.bscscan.com";

  return (
    <div className="flex flex-col items-center justify-start px-4 py-6"> 
      <div className="text-center max-w-4xl w-full mb-6"> 
        <h1 className="text-3xl font-bold text-[#184494ff] mb-2"> 
          Verificación de Estudiante
        </h1>
        <p className="text-md text-gray-600 mb-6"> 
          Verifica si una dirección de wallet pertenece a un estudiante de la Universidad San Simón
        </p>
      </div>

      <div className="bg-white rounded-xl shadow p-6 border border-gray-100 w-full max-w-2xl mb-8">
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex flex-col md:flex-row gap-2">
            <div className="flex-grow">
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => {
                  setWalletAddress(e.target.value);
                  setError("");
                  setVerificationResult(null);
                }}
                placeholder="Ingrese la dirección de wallet del estudiante"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#184494ff]"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#184494ff] text-white py-3 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-[#13367a] transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Verificando...
                </>
              ) : (
                <>
                  <SearchIcon className="w-4 h-4" />
                  Buscar
                </>
              )}
            </button>
          </div>
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </form>
        
        <div className="text-xs text-gray-500">
          <p>Ejemplo de dirección válida: 0x9EEdE44805fab1d4F16EfD43eF4F5dC9416FBDC4</p>
        </div>
      </div>

      {/* Resultados de verificación */}
      {verificationResult && (
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100 w-full max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            {verificationResult.isValid ? (
              <>
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckIcon className="text-green-600 w-6 h-6" />
                </div>
                <h2 className="text-xl font-semibold text-green-700">
                  ¡Estudiante Verificado!
                </h2>
              </>
            ) : (
              <>
                <div className="p-2 bg-red-100 rounded-full">
                  <XIcon className="text-red-600 w-6 h-6" />
                </div>
                <h2 className="text-xl font-semibold text-red-700">
                  Estudiante No Encontrado
                </h2>
              </>
            )}
          </div>

          {verificationResult.isValid ? (
            <>
              <div className="mb-4">
                <p className="text-gray-700 mb-2">
                  La dirección <span className="font-mono bg-gray-100 px-2 py-1 rounded">{verificationResult.walletAddress}</span> pertenece a un estudiante de la Universidad San Simón.
                </p>
                <p className="text-gray-700">
                  Código SIS: <span className="font-bold">{verificationResult.sisCode}</span>
                </p>
                {verificationResult.studentAddress && (
                  <p className="text-gray-700">
                    Dirección verificada: <span className="font-mono text-sm">{verificationResult.studentAddress}</span>
                  </p>
                )}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                  <InfoIcon className="w-4 h-4" />
                  Información de Verificación
                </h3>
                <div className="flex flex-col gap-2">
                  {verificationResult.links && verificationResult.links.nftTransfers && (
                    <a 
                      href={verificationResult.links.nftTransfers}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Ver transferencias de NFT en BscScan
                      <ExternalLinkIcon className="w-4 h-4" />
                    </a>
                  )}
                  {verificationResult.links && verificationResult.links.contractVerification && (
                    <a 
                      href={verificationResult.links.contractVerification}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Verificar en el contrato inteligente
                      <ExternalLinkIcon className="w-4 h-4" />
                    </a>
                  )}
                  {/* Enlace de respaldo si no vienen los links del API */}
                  {(!verificationResult.links || !verificationResult.links.nftTransfers) && (
                    <a 
                      href={`${bscScanBaseUrl}/address/${verificationResult.walletAddress}#nfttransfers`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Ver transferencias de NFT en BscScan
                      <ExternalLinkIcon className="w-4 h-4" />
                    </a>
                  )}
                  {(!verificationResult.links || !verificationResult.links.contractVerification) && (
                    <a 
                      href={`${bscScanBaseUrl}/readContract?m=light&a=${contractAddress}&n=bsc&v=${contractAddress}#`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Verificar metadata en el contrato
                      <ExternalLinkIcon className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">Instrucciones de Verificación</h3>
                <ol className="text-sm text-gray-700 list-decimal pl-5 space-y-2">
                  <li>Haga clic en el enlace "Ver transferencias de NFT en BscScan" para confirmar que la dirección tiene el NFT de estudiante.</li>
                  <li>En BscScan, verifique el número de NFT que pertenece al estudiante en la sección de transferencias de NFT.</li>
                  <li>Para verificar los datos del estudiante junto a su respectivo kardex, utilice el enlace "Verificar en el contrato inteligente".</li>
                  <li>En la página del contrato, busque la función "tokenURI" e ingrese el numero de NFT que esta asociado con el estudiante.</li>
                </ol>
              </div>
            </>
          ) : (
            <div className="text-gray-700">
              <p>{verificationResult.message || "La dirección proporcionada no está asociada a ningún estudiante de la Universidad San Simón."}</p>
              <p className="mt-2">Por favor, verifique que la dirección sea correcta o contacte al administrador del sistema.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VerifyPage;