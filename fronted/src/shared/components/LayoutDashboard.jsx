import React from "react";
import { Outlet } from "react-router-dom";
import { NavbarDashboard } from "../../features/dashboard/NavbarDashboard";

export function LayoutDashboard() {
  return (
    <div className="flex flex-col min-h-screen bg-[#dfe0e1]">
      <NavbarDashboard />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}