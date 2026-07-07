import StudentLoginForm from "./components/StudentLoginForm";
import React from "react";
import { ShieldIcon } from "../../shared/components/Icons";

const StudentLoginPage = () => {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-180px)] px-4">
        <div className="w-full max-w-md">
          <div className="theme-card rounded-2xl shadow-sm overflow-hidden border">
            <div className="bg-brand-blue px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <ShieldIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Acceso Estudiantes</h2>
                  <p className="text-white/60 text-xs">Ingresa tu codigo SIS para obtener tus credenciales</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <StudentLoginForm />
            </div>
          </div>
        </div>
      </div>
    );
};

export default StudentLoginPage;
