import React from "react";
import { AlertTriangleIcon } from "./Icons";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen theme-surface">
          <div className="text-center max-w-md mx-4">
            <div className="w-16 h-16 bg-brand-red/10 dark:bg-brand-red/20 rounded-full flex items-center justify-center mx-auto mb-5">
              <AlertTriangleIcon className="w-8 h-8 text-brand-red" />
            </div>
            <h1 className="text-xl font-bold theme-text mb-2">Algo salió mal</h1>
            <p className="text-sm theme-text-secondary mb-6">
              Ocurrió un error inesperado. Por favor, recarga la página para continuar.
            </p>
            <button
              onClick={this.handleReload}
              className="px-6 py-2.5 bg-brand-blue text-white rounded-lg text-sm font-medium hover:bg-brand-blue/90 transition-colors"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
