import React from "react"

export function Footer() {
    return (
      <footer className="bg-white py-4 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>© {new Date().getFullYear()} Universidad Mayor de San Simón. Todos los derechos reservados.</p>
          <p className="text-xs mt-1">Powered by Blockchain Technology</p>
        </div>
      </footer>
    )
  }
  
  