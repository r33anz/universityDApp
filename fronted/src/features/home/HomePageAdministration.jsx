import React from "react";
import { Link } from "react-router-dom";
import { UploadIcon, NotificationsIcon } from "../../shared/components/Icons";

const AdminHomePage = () => {
  return (
    <div className="flex flex-col items-center justify-start px-4 py-8">
      <div className="text-center max-w-2xl w-full mb-10">
        <h1 className="text-3xl font-bold text-brand-blue dark:text-blue-300 mb-2">
          Panel de Administracion
        </h1>
        <p className="theme-text-secondary">
          Gestion integral de kardex academico mediante blockchain
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5 max-w-3xl w-full">
        <div className="theme-card rounded-xl shadow-sm p-6 border hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-brand-blue/10 dark:bg-brand-blue/20 rounded-xl group-hover:bg-brand-blue/15 dark:group-hover:bg-brand-blue/30 transition-colors">
              <UploadIcon className="w-5 h-5 text-brand-blue dark:text-blue-300" />
            </div>
            <h2 className="text-lg font-semibold theme-text">Carga de Kardex</h2>
          </div>
          <p className="text-sm theme-text-secondary mb-3">
            Sube el kardex estudiantil en formato JSON. El sistema verificara que el codigo SIS coincida antes de proceder.
          </p>
          <ul className="text-xs theme-text-tertiary mb-5 space-y-1.5">
            <li className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-brand-blue/30"></span>
              Formato aceptado: JSON
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-brand-blue/30"></span>
              Validacion automatica de codigo SIS
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-brand-blue/30"></span>
              Registro en blockchain tras validacion
            </li>
          </ul>
          <Link
            to="/administracion/manejo_archivo"
            className="inline-flex items-center justify-center w-full bg-brand-blue text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-brand-blue/90 transition-colors"
          >
            Ir a Carga de Archivos
          </Link>
        </div>

        <div className="theme-card rounded-xl shadow-sm p-6 border hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-brand-gold/10 dark:bg-brand-gold/20 rounded-xl group-hover:bg-brand-gold/15 dark:group-hover:bg-brand-gold/30 transition-colors">
              <NotificationsIcon className="w-5 h-5 text-brand-gold" />
            </div>
            <h2 className="text-lg font-semibold theme-text">Solicitudes de Kardex</h2>
          </div>
          <p className="text-sm theme-text-secondary mb-3">
            Gestiona las notificaciones y solicitudes de kardex. El sistema enviara mensajes al email del WEBSIS.
          </p>
          <ul className="text-xs theme-text-tertiary mb-5 space-y-1.5">
            <li className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-brand-gold/30"></span>
              Gestion de solicitudes entrantes
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-brand-gold/30"></span>
              Notificaciones por correo electronico
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-brand-gold/30"></span>
              Seguimiento de solicitudes pendientes
            </li>
          </ul>
          <Link
            to="/administracion/notificaciones"
            className="inline-flex items-center justify-center w-full bg-brand-gold text-gray-900 py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-brand-gold/90 transition-colors"
          >
            Gestionar Solicitudes
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminHomePage;
