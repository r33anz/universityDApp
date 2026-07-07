import { Link, useLocation } from "react-router-dom";
import React, { useState } from "react";
import logo from "../../assets/images/logofinal.png";
import { useTheme } from "../../shared/providers/ThemeProvider";
import { SunIcon, MoonIcon } from "../../shared/components/Icons";

export function NavbarDashboard() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const { isDark, toggleTheme } = useTheme();

    const links = [
        { to: "/administracion", label: "Panel", exact: true },
        { to: "/administracion/notificaciones", label: "Notificaciones" },
        { to: "/administracion/manejo_archivo", label: "Subida de Archivo" },
    ];

    const isActive = (path, exact) => {
        if (exact) return location.pathname === path;
        return location.pathname.startsWith(path);
    };

    return (
        <header className="bg-brand-blue text-white shadow-lg sticky top-0 z-40">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="flex justify-between items-center h-20">
                    <div className="flex items-center space-x-4">
                        <Link to="/" className="flex items-center space-x-4 flex-shrink-0 group">
                            <div className="relative">
                                <div className="absolute -inset-1.5 bg-white/20 rounded-xl blur-sm group-hover:bg-white/30 transition-all duration-300"></div>
                                <img src={logo} alt="Logo UMSS" className="h-14 w-auto relative rounded-lg" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-bold tracking-tight leading-tight">transferKardex</span>
                                <span className="text-[11px] text-white/50 font-medium tracking-wider uppercase leading-tight">UMSS Blockchain</span>
                            </div>
                        </Link>
                        <span className="hidden sm:inline-block px-2.5 py-1 bg-brand-gold/20 text-brand-gold text-xs font-semibold rounded-lg border border-brand-gold/30">
                            Admin
                        </span>
                    </div>

                    <div className="hidden md:flex items-center space-x-1">
                        <nav className="flex items-center space-x-1 mr-2">
                            {links.map(({ to, label, exact }) => (
                                <Link
                                    key={to}
                                    to={to}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        isActive(to, exact)
                                            ? "bg-white/15 text-white"
                                            : "text-white/70 hover:text-white hover:bg-white/10"
                                    }`}
                                >
                                    {label}
                                </Link>
                            ))}
                        </nav>
                        <div className="w-px h-6 bg-white/20 mx-1"></div>
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                            aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                        >
                            {isDark ? <SunIcon className="w-4.5 h-4.5" /> : <MoonIcon className="w-4.5 h-4.5" />}
                        </button>
                        <Link
                            to="/"
                            className="ml-1 px-3 py-2 rounded-lg text-sm font-medium text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            Salir
                        </Link>
                    </div>

                    <div className="md:hidden flex items-center space-x-1">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            aria-label="Toggle theme"
                        >
                            {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                        </button>
                        <button
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            aria-label="Toggle menu"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                {mobileOpen ? (
                                    <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                                ) : (
                                    <><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></>
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {mobileOpen && (
                    <nav className="md:hidden pb-4 space-y-1 border-t border-white/10 pt-3">
                        {links.map(({ to, label, exact }) => (
                            <Link
                                key={to}
                                to={to}
                                onClick={() => setMobileOpen(false)}
                                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                    isActive(to, exact)
                                        ? "bg-white/15 text-white"
                                        : "text-white/70 hover:text-white hover:bg-white/10"
                                }`}
                            >
                                {label}
                            </Link>
                        ))}
                        <Link
                            to="/"
                            onClick={() => setMobileOpen(false)}
                            className="block px-4 py-2.5 rounded-lg text-sm font-medium text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            Salir al inicio
                        </Link>
                    </nav>
                )}
            </div>
        </header>
    );
}
