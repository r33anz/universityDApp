import React from "react";
import { UploadIcon } from "../../../shared/components/Icons";

export function FileUploader({ onFileUpload }) {
    const handleChange = (e) => {
      const file = e.target.files[0];
      if (file && file.type === "application/json") {
        onFileUpload(file);
      }
    };
  
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <input
          type="file"
          accept=".json"
          onChange={handleChange}
          className="hidden"
          id="json-upload"
        />
        <label
          htmlFor="json-upload"
          className="cursor-pointer flex flex-col items-center justify-center space-y-2"
        >
          <UploadIcon className="h-8 w-8 text-gray-400" />
          <span className="text-lg font-medium">Subir archivo JSON</span>
          <span className="text-sm text-gray-500">Arrastra o haz clic para seleccionar</span>
        </label>
      </div>
    );
  }
  