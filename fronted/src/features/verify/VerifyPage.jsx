import React, { useState } from "react";
import {
  SearchIcon,
  CheckIcon,
  XIcon,
  InfoIcon,
  ExternalLinkIcon
} from "../../shared/components/Icons";
import { verifyStudentByWallet } from "./verifyService";
import { getApiErrorMessage } from "../../shared/lib/apiError";

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
        setError(response.message || "Error en la verificacion");
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!walletAddress.trim()) {
      setError("Por favor, ingrese una direccion de wallet");
      return;
    }
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!ethAddressRegex.test(walletAddress)) {
      setError("Por favor, ingrese una direccion de wallet valida");
      return;
    }
    verifyStudent(walletAddress);
  };

  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS_PROXY_MANAGEMENT_CREDENTIAL || "0x07F751090e3f279CC7CEd7306C1B0d6949cc9d64";
  const bscScanBaseUrl = "https://testnet.bscscan.com";

  return (
    <div className="flex flex-col items-center justify-start px-4 py-8">
      <div className="text-center max-w-4xl w-full mb-8">
        <h1 className="text-3xl font-bold text-brand-blue dark:text-blue-300 mb-2">
          Verificacion de Estudiante
        </h1>
        <p className="theme-text-secondary">
          Verifica si una direccion de wallet pertenece a un estudiante de la Universidad San Simon
        </p>
      </div>

      <div className="theme-card rounded-xl shadow-sm p-6 border w-full max-w-2xl mb-8" style={{ borderColor: 'var(--border-primary)' }}>
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
                placeholder="Ingrese la direccion de wallet del estudiante"
                className="w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue theme-text transition-colors"
                style={{ backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-primary)', border: '1px solid var(--border-primary)' }}
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-brand-blue text-white py-3 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-brand-blue/90 transition-colors disabled:opacity-50"
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
          {error && <p className="text-brand-red text-sm mt-2">{error}</p>}
        </form>
        <p className="text-xs theme-text-tertiary">Ejemplo de direccion valida: 0x9EEdE44805fab1d4F16EfD43eF4F5dC9416FBDC4</p>
      </div>

      {verificationResult && (
        <div className="theme-card rounded-xl shadow-sm p-6 border w-full max-w-2xl" style={{ borderColor: 'var(--border-primary)' }}>
          <div className="flex items-center gap-3 mb-4">
            {verificationResult.isValid ? (
              <>
                <div className="p-2 bg-brand-teal/10 dark:bg-brand-teal/20 rounded-full">
                  <CheckIcon className="text-brand-teal w-6 h-6" />
                </div>
                <h2 className="text-xl font-semibold text-brand-teal">Estudiante Verificado</h2>
              </>
            ) : (
              <>
                <div className="p-2 bg-brand-red/10 dark:bg-brand-red/20 rounded-full">
                  <XIcon className="text-brand-red w-6 h-6" />
                </div>
                <h2 className="text-xl font-semibold text-brand-red">Estudiante No Encontrado</h2>
              </>
            )}
          </div>

          {verificationResult.isValid ? (
            <>
              <div className="mb-4 space-y-2">
                <p className="theme-text-secondary">
                  La direccion <span className="font-mono theme-muted px-2 py-1 rounded theme-text text-sm">{verificationResult.walletAddress}</span> pertenece a un estudiante de la Universidad San Simon.
                </p>
                <p className="theme-text-secondary">
                  Codigo SIS: <span className="font-bold theme-text">{verificationResult.sisCode}</span>
                </p>
                {verificationResult.studentAddress && (
                  <p className="theme-text-secondary">
                    Direccion verificada: <span className="font-mono text-sm theme-text">{verificationResult.studentAddress}</span>
                  </p>
                )}
              </div>

              <div className="bg-brand-blue/5 dark:bg-brand-blue/10 p-4 rounded-xl mb-4 border border-brand-blue/10 dark:border-brand-blue/20">
                <h3 className="font-medium text-brand-blue dark:text-blue-300 mb-2 flex items-center gap-2">
                  <InfoIcon className="w-4 h-4" />
                  Informacion de Verificacion
                </h3>
                <div className="flex flex-col gap-2">
                  {verificationResult.links?.nftTransfers && (
                    <a href={verificationResult.links.nftTransfers} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-brand-blue dark:text-blue-300 hover:underline transition-colors text-sm">
                      Ver transferencias de NFT en BscScan <ExternalLinkIcon className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {verificationResult.links?.contractVerification && (
                    <a href={verificationResult.links.contractVerification} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-brand-blue dark:text-blue-300 hover:underline transition-colors text-sm">
                      Verificar en el contrato inteligente <ExternalLinkIcon className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {(!verificationResult.links || !verificationResult.links.nftTransfers) && (
                    <a href={`${bscScanBaseUrl}/address/${verificationResult.walletAddress}#nfttransfers`} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-brand-blue dark:text-blue-300 hover:underline transition-colors text-sm">
                      Ver transferencias de NFT en BscScan <ExternalLinkIcon className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {(!verificationResult.links || !verificationResult.links.contractVerification) && (
                    <a href={`${bscScanBaseUrl}/readContract?m=light&a=${contractAddress}&n=bsc&v=${contractAddress}#`} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-brand-blue dark:text-blue-300 hover:underline transition-colors text-sm">
                      Verificar metadata en el contrato <ExternalLinkIcon className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              <div className="theme-muted p-4 rounded-xl">
                <h3 className="font-medium theme-text mb-2">Instrucciones de Verificacion</h3>
                <ol className="text-sm theme-text-secondary list-decimal pl-5 space-y-2">
                  <li>Haga clic en el enlace "Ver transferencias de NFT en BscScan" para confirmar que la direccion tiene el NFT de estudiante.</li>
                  <li>En BscScan, verifique el numero de NFT que pertenece al estudiante en la seccion de transferencias de NFT.</li>
                  <li>Para verificar los datos del estudiante junto a su respectivo kardex, utilice el enlace "Verificar en el contrato inteligente".</li>
                  <li>En la pagina del contrato, busque la funcion "tokenURI" e ingrese el numero de NFT que esta asociado con el estudiante.</li>
                </ol>
              </div>
            </>
          ) : (
            <div className="theme-text-secondary">
              <p>{verificationResult.message || "La direccion proporcionada no esta asociada a ningun estudiante de la Universidad San Simon."}</p>
              <p className="mt-2">Por favor, verifique que la direccion sea correcta o contacte al administrador del sistema.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VerifyPage;
