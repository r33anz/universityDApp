import React from "react";
import { NavBar } from "./NavBar";
import { Footer } from "./Footer";
import { Outlet } from "react-router-dom";

export function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-[#dfe0e1]">
      <NavBar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}