import { Link } from "react-router-dom";
import { Button } from "./Button";
import React from "react"
import logo from "../../assets/images/logofinal.png"

export function NavBar() {
    return(
        <header className="bg-[#184494ff] text-white py-5 px-7 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center space-x-3 cursor-pointer">
                    <img
                     src={logo} 
                     alt="Logo UMSS" 
                     className="h-16 w-auto" />
                    
                    <div className="text-3xl font-bold">
                        transferKardex
                    </div>
                </div>
                <nav className="hidden md:flex space-x-6">
                    <Link to="/" className="text-xl text-white hover:text-[#e3b505ff] transition-colors">
                        Inicio
                    </Link>
                    <Link to="/administracion" className="text-xl text-white hover:text-[#e3b505ff] transition-colors">
                        Administracion
                    </Link>
                    <Link to="/estudiante" className="text-xl text-white hover:text-[#e3b505ff] transition-colors font-medium">
                        Estudiantes
                    </Link>
                </nav>
                <div className="md:hidden">
                    <Button variant="ghost" size="sm">
                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        >
                        <line x1="4" x2="20" y1="12" y2="12" />
                        <line x1="4" x2="20" y1="6" y2="6" />
                        <line x1="4" x2="20" y1="18" y2="18" />
                        </svg>
                    </Button>
                </div>
            </div>
        </header>
    )
}