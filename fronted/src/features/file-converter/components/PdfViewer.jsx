import React,{useState} from "react";

export function PdfViewer({ file, fileName, career }) {
  const [error, setError] = useState(false);

  return (
    <div className="border rounded-lg overflow-hidden h-full flex flex-col">
      {/* Encabezado */}
      <div className="bg-gray-100 p-3 border-b">
        <h3 className="font-medium">{fileName || 'Vista previa'}</h3>
        {career && <p className="text-sm text-gray-600">{career}</p>}
      </div>

      {/* Contenido del PDF */}
      <div className="flex-1 bg-gray-50">
        {file && !error ? (
          <iframe
            src={`${file}#toolbar=0&navpanes=0`}
            className="w-full h-full"
            title="PDF Preview"
            onError={() => setError(true)}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-4">
            {error ? (
              <div className="text-center">
                <p className="text-red-500">Error al cargar el PDF</p>
                <a 
                  href={file} 
                  download={fileName || 'documento.pdf'}
                  className="text-blue-500 mt-2 inline-block"
                >
                  Descargar PDF
                </a>
              </div>
            ) : (
              <p className="text-gray-500">Selecciona un documento</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}