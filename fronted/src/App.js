import React from "react";
import { AppRouter } from "./routes/AppRouter";
import { ToastProvider } from "./shared/providers/ToastProvider";
import { ThemeProvider } from "./shared/providers/ThemeProvider";
import { ErrorBoundary } from "./shared/components/ErrorBoundary";

function App() {
    return (
        <ThemeProvider>
            <ErrorBoundary>
                <ToastProvider>
                    <AppRouter />
                </ToastProvider>
            </ErrorBoundary>
        </ThemeProvider>
    );
}

export default App;
