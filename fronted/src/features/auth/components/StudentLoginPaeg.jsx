import StudentLoginForm from "./StudentLoginForm";
import React from "react";

const StudentLoginPage = () => {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-180px)] px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="bg-[#184494ff] p-4 text-white">
              <h2 className="text-xl font-bold flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Acceso Estudiantes
              </h2>
            </div>
            <div className="p-6">
              <StudentLoginForm />
            </div>
          </div>
        </div>
      </div>
    )
  }

export default StudentLoginPage;