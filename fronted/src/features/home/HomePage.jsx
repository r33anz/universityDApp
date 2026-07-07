import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  EyeIcon,
  ShieldIcon,
  InfoIcon,
  CopyIcon,
  CheckIcon
} from "../../shared/components/Icons";
import { copyToClipboard } from "../../shared/lib/clipboard";
import logo from "../../assets/images/logofinal.png";

const AddressCard = React.memo(function AddressCard({ title, address }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const truncateAddress = (addr) => {
    if (!addr) return "No configurada";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <div className="theme-card rounded-xl p-4 border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 bg-brand-blue/10 dark:bg-brand-blue/20 rounded-lg">
          <InfoIcon className="text-brand-blue w-4 h-4" />
        </div>
        <h3 className="font-medium theme-text text-sm">{title}</h3>
      </div>
      <div className="flex items-center justify-between theme-muted p-2.5 rounded-lg">
        <p className="font-mono text-xs theme-text-secondary" title={address}>
          {truncateAddress(address)}
        </p>
        <button
          onClick={() => handleCopy(address)}
          className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          title="Copiar direccion"
          aria-label={`Copiar ${title}`}
        >
          {copied ? (
            <CheckIcon className="w-3.5 h-3.5 text-brand-teal" />
          ) : (
            <CopyIcon className="w-3.5 h-3.5 theme-text-tertiary" />
          )}
        </button>
      </div>
    </div>
  );
});

const HomePage = () => {
  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
  const universityWallet = process.env.REACT_APP_WALLET_ADDRESS;
  const nftAddress = process.env.REACT_APP_NFT_ADDRESS;

  return (
    <div className="flex flex-col items-center justify-start px-4 py-8">
      <div className="text-center max-w-2xl w-full mb-10">
        <div className="flex justify-center mb-5">
          <div className="relative">
            <div className="absolute -inset-3 bg-brand-blue/10 dark:bg-brand-blue/20 rounded-3xl blur-xl"></div>
            <img src={logo} alt="Logo UMSS" className="h-20 w-auto relative rounded-2xl" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-brand-blue dark:text-blue-300 mb-3">
          transferKardex
        </h1>
        <p className="theme-text-secondary text-lg">
          Sistema blockchain para la gestion de kardex academico
        </p>
        <p className="theme-text-tertiary text-sm mt-1">
          Universidad Mayor de San Simon
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 w-full max-w-5xl mb-10">
        <AddressCard title="Wallet Institucional" address={universityWallet} />
        <AddressCard title="Contrato de Credenciales" address={contractAddress} />
        <AddressCard title="Contrato NFT" address={nftAddress} />
      </div>

      <div className="grid md:grid-cols-2 gap-5 max-w-3xl w-full">
        <div className="theme-card rounded-xl shadow-sm p-6 border hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-brand-blue/10 dark:bg-brand-blue/20 rounded-xl group-hover:bg-brand-blue/15 dark:group-hover:bg-brand-blue/30 transition-colors">
              <EyeIcon className="w-5 h-5 text-brand-blue dark:text-blue-300" />
            </div>
            <h2 className="text-lg font-semibold theme-text">Estudiantes</h2>
          </div>
          <p className="text-sm theme-text-secondary mb-5">
            Accede a tu kardex academico de forma segura mediante blockchain.
          </p>
          <Link
            to="/estudiante"
            className="inline-flex items-center justify-center w-full bg-brand-blue text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-brand-blue/90 transition-colors"
          >
            Acceder
          </Link>
        </div>

        <div className="theme-card rounded-xl shadow-sm p-6 border hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-brand-teal/10 dark:bg-brand-teal/20 rounded-xl group-hover:bg-brand-teal/15 dark:group-hover:bg-brand-teal/30 transition-colors">
              <ShieldIcon className="w-5 h-5 text-brand-teal dark:text-teal-300" />
            </div>
            <h2 className="text-lg font-semibold theme-text">Administracion</h2>
          </div>
          <p className="text-sm theme-text-secondary mb-5">
            Gestiona calificaciones y kardex de estudiantes.
          </p>
          <Link
            to="/administracion"
            className="inline-flex items-center justify-center w-full bg-brand-teal text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-brand-teal/90 transition-colors"
          >
            Acceder
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
