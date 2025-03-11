import React from "react"
import { Link } from "react-router-dom";

const  HomePage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-180px)] px-4">
        <div className="text-center max-w-4xl w-full mb-12">
          <h1 className="text-4xl font-bold text-[#184494ff] mb-4">Bienvenido a transferKardex</h1>
          <p className="text-lg text-gray-600 mb-12">
            Sistema blockchain para la gestión de kardex académico de la Universidad Mayor de San Simón
          </p>
        </div>
  
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:border-[#184494ff]/20 transition-all">
            <h2 className="text-2xl font-semibold text-[#184494ff] mb-4">Para Estudiantes</h2>
            <p className="text-gray-600 mb-6">Accede a tu kardex y gestiona tus documentos académicos de forma segura.</p>
            <Link
              to="/estudiantes"
              className="inline-block w-full bg-[#184494ff] text-white py-3 px-6 rounded-lg text-center hover:bg-[#184494ff]/90 transition-colors"
            >
              Acceso Estudiantes
            </Link>
          </div>
  
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:border-[#107e7dff]/20 transition-all">
            <h2 className="text-2xl font-semibold text-[#184494ff] mb-4">Para Docentes</h2>
            <p className="text-gray-600 mb-6">
              Gestiona calificaciones y accede a información académica de tus estudiantes.
            </p>
            <Link
              to="/docentes"
              className="inline-block w-full bg-[#107e7dff] text-white py-3 px-6 rounded-lg text-center hover:bg-[#107e7dff]/90 transition-colors"
            >
              Acceso Docentes
            </Link>
          </div>
        </div>
      </div>
    )
  }
  
export default HomePage;