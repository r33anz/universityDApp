import React from "react";
import { Outlet } from "react-router-dom";
import { NavbarDashboard } from "../../features/dashboard/NavbarDashboard";

export function LayoutDashboard() {
  return (
    <div className="flex flex-col min-h-screen theme-surface">
      <NavbarDashboard />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
