import React, { Suspense } from "react";
import { BrowserRouter, useRoutes } from "react-router-dom";
import { routes } from "./routes";

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen theme-surface">
    <div className="flex flex-col items-center space-y-3">
      <div className="w-8 h-8 border-3 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm theme-text-secondary">Cargando...</p>
    </div>
  </div>
);

const Router = () => {
  const element = useRoutes(routes);
  return element;
};

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Router />
      </Suspense>
    </BrowserRouter>
  );
};
