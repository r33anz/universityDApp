import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function useAuth() {
    const [isLoading, setSetIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const login = async (rol,credential) => {
        setSetIsLoading(true);
        setError(null);

        try {
            // Call the login API

           if(rol === "student"){
               navigate("/showSeedPhrase");
            }

            navigate("/teacherDashboard")
        } catch (error) {
            setError(error);
        } finally {
            setSetIsLoading(false);
        }
    };

    return {
        login,
        isLoading,
        error,
    };
}
