import React from "react";
import { AppRouter } from "./routes/AppRouter";
import { ToastProvider } from "./shared/providers/ToastProvider";

const apiUrl = `${process.env.REACT_APP_API_PROTOCOL}://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}`;

function App() {
    return (
        <ToastProvider>
             <AppRouter />
        </ToastProvider>    
    );
}

export default App;