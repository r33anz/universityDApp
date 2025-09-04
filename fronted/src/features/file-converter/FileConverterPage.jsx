import React, { useState,useEffect } from 'react';
import { FileUploader } from './components/FileUploader';
import { PdfViewer } from './components/PdfViewer';
import { ConversionModal } from './components/ConversionModal';
import { SubmitForm } from './components/SubmitForm';
import {generateIndividualPdfs } from './service/jsonToPdf';
import { uploadMultiplePdfsWithSisCode} from './service/pdfService';
import { ResultModal } from './components/RessultModal';
import { ApiError } from '../../shared/lib/apiError';
import { useToastContext } from '../../shared/providers/ToastProvider';

function FileConverterPage() {
  const [isConverting, setIsConverting] = useState(false);
  const [sisCode, setSisCode] = useState('');
  const [sisCodeVerification, setSisCodeVerification] = useState('');
  const [step, setStep] = useState(1); 
  const [PdfFiles, setPdfFiles] = useState([]);
  const [pdfsByCareer, setPdfsByCareer] = useState({});
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [uploadResult, setUploadResult] = useState({ show: false, success: false, message: '' });
  const toast = useToastContext();

  useEffect(() => {
    if (PdfFiles.length > 0) {
      const grouped = PdfFiles.reduce((acc, pdf) => {
        if (!acc[pdf.career]) {
          acc[pdf.career] = [];
        }
        acc[pdf.career].push(pdf);
        return acc;
      }, {});
      setPdfsByCareer(grouped);
    }
  }, [PdfFiles]);

  useEffect(() => {
  }, [PdfFiles]);

  const handleFileUpload = async (fileOrError) => {
    setIsConverting(true);

    try {
      if (fileOrError instanceof Error) {
        throw fileOrError;
      }
  
      if (!fileOrError || !(fileOrError.name.endsWith('.json') || fileOrError.type === "application/json")) {
        throw new Error("FORMATO_INVALIDO");
      }

      const {individualPdfs,sisCode: jsonsiscode} = await generateIndividualPdfs(fileOrError);
      setSisCodeVerification(jsonsiscode);

      const pdfsWithUrls = individualPdfs.map(pdf => ({
        ...pdf,
        url: URL.createObjectURL(pdf.blob)
      }));
      
      setPdfFiles(pdfsWithUrls);
      setStep(2);
    } catch (error) {
      if (error.message === "FORMATO_INVALIDO") {
        toast.error("Debe subir un archivo en formato JSON válido (.json)");
      }else if (error.message.includes("Faltan campos requeridos")) {
        toast.error(`Error en el formato: ${error.message}`);
      }else if (error.message.includes("El campo 'Carrera(s)'")) {
        toast.error("El formato de carreras en el JSON no es válido");
      }else if (error.message.includes("El archivo JSON está vacío")) {
        toast.error("El archivo seleccionado está vacío");
      }else if (error.message.includes("No se generaron PDFs")) {
        toast.error("El archivo no contiene materias válidas para procesar");
      }else if (error.message.includes("Error al leer el archivo")) {
        toast.error("No se pudo leer el archivo. Puede estar corrupto");
      }else {
        toast.error(`Error al procesar el archivo: ${error.message || 'Error desconocido'}`);
      }
      
    } finally {
      setIsConverting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsConverting(true);

      if(sisCode !== sisCodeVerification){
        throw new Error("Sin coincidencia");
      }
      const response = await uploadMultiplePdfsWithSisCode(PdfFiles, sisCode);
      
      PdfFiles.forEach(pdf => URL.revokeObjectURL(pdf.url));
      
      setUploadResult({
        show: true,
        success: true,
        message: response.message || 'Archivos subidos con éxito'
      });
      
      setTimeout(() => {
        setSisCode('');
        setStep(1);
        setPdfFiles([]);
        setUploadResult({ show: false, success: false, message: '' });
      }, 4000);
    } catch (error) {
      if (error.message === "Sin coincidencia") {
        toast.error("El código SIS ingresado no coincide con el del kardex ingresado.");
      }else if (error.response?.data) {
        const apiError = new ApiError(
          error.response.data.message,
          error.response.data.errorCode,
          error.response.data.details
        );
      
        toast.error(apiError.getStatusErrorMessage())
      }else if (error instanceof ApiError || error.name === "ApiError") {
        toast.error(error.getStatusErrorMessage())
      }else{
        toast.error("Ocurrió un error inesperado")
      }
    } finally {
      setIsConverting(false);
    }
  };

  const closeResultModal = () => {
    setUploadResult({ show: false, success: false, message: '' });
  };

  useEffect(() => {
    return () => {
      PdfFiles.forEach(pdf => {
        if (pdf.url) URL.revokeObjectURL(pdf.url);
      });
    };
  }, [PdfFiles]);

  return (
    <div className="max-w-6xl mx-auto  bg-green ">
      {step === 1 && (
        <FileUploader onFileUpload={handleFileUpload} />
      )}

      {step === 2 && PdfFiles.length > 0 && (
              <div className="flex flex-col" style={{ height: 'calc(100vh - 120px)' }}> 
                <div className="flex flex-1 gap-2 min-h-0">

                  {/* Lista de materias */}
                  <div className="w-1/5 bg-white p-2 rounded-lg shadow-md flex flex-col border border-gray-200" style={{ maxHeight: '70vh' }}>
                    <h2 className="text-lg font-semibold mb-2 sticky top-0 bg-white pb-2"> 
                      Materias generadas ({PdfFiles.length})
                    </h2>
                    <div className="flex-1 overflow-y-auto">
                      {Object.entries(pdfsByCareer).map(([career, careerPdfs]) => (
                        <div key={career} className="mb-2">
                          <h3 className="font-bold text-sm mb-1 p-1 bg-gray-100 rounded">
                            {career} ({careerPdfs.length})
                          </h3>
                          <ul className="space-y-0.5">
                            {careerPdfs.map((pdf, index) => (
                              <li 
                                key={index}
                                className={`p-1 rounded cursor-pointer text-xs ${
                                  selectedPdf?.filename === pdf.filename 
                                    ? 'bg-blue-100 font-medium' 
                                    : 'hover:bg-gray-50'
                                }`}
                                onClick={() => setSelectedPdf(pdf)}
                              >
                                {pdf.subject}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    
                    {/* Formulario SIS */}
                    <div className="mt-1 pt-1 sticky bottom-0 bg-white"> 
                      <SubmitForm 
                        sisCode={sisCode} 
                        setSisCode={setSisCode} 
                        onSubmit={handleSubmit} 
                        compact={true}
                      />
                    </div>
                  </div>

                  {/* Visor PDF */}
                  <div className="flex-1 bg-white px-2 rounded-lg shadow-md overflow-auto border border-gray-200" style={{ maxHeight: '70vh' }}>
                    <PdfViewer 
                      file={selectedPdf?.url}
                      fileName={selectedPdf?.subject}
                      career={selectedPdf?.career}
                      metadata={{
                        gestion: selectedPdf?.gestion,
                        nota: selectedPdf?.nota,
                        creditos: selectedPdf?.creditos
                      }}
                    />
                  </div>
                </div>
              </div>
      )}

        <ConversionModal isOpen={isConverting} />

        <ResultModal 
          isOpen={uploadResult.show} 
          onClose={closeResultModal} 
          result={uploadResult}
        />

      </div>
  );
}

export default FileConverterPage;