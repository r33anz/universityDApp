import React, { useState,useEffect } from 'react';
import { FileUploader } from './components/FileUploader';
import { PdfViewer } from './components/PdfViewer';
import { ConversionModal } from './components/ConversionModal';
import { SubmitForm } from './components/SubmitForm';
import {generateIndividualPdfs } from './service/jsonToPdf';
import { uploadMultiplePdfsWithSisCode} from './service/pdfService';

function FileConverterPage() {
  const [pdfFile, setPdfFile] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [sisCode, setSisCode] = useState('');
  const [step, setStep] = useState(1); 
  const [PdfFiles, setPdfFiles] = useState([]);
  const [selectedPdfIndex, setSelectedPdfIndex] = useState(0);
  const [pdfsByCareer, setPdfsByCareer] = useState({});
  const [selectedPdf, setSelectedPdf] = useState(null);

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
    console.log('PDF Files updated:', PdfFiles);
  }, [PdfFiles]);

  const handleFileUpload = async (jsonFile) => {
    setIsConverting(true);
    
    
    try {
      // Verificación adicional del archivo
      if (!jsonFile || !jsonFile.name.endsWith('.json')) {
        throw new Error('Por favor, sube un archivo JSON válido');
      }

      const individualPdfs = await generateIndividualPdfs(jsonFile);
      const pdfsWithUrls = individualPdfs.map(pdf => ({
        ...pdf,
        url: URL.createObjectURL(pdf.blob)
      }));
      
      setPdfFiles(pdfsWithUrls);
      setStep(2);
    } catch (error) {
      console.error("Error converting file:", error,error.message);
    } finally {
      setIsConverting(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsConverting(true);

      const response = await uploadMultiplePdfsWithSisCode(PdfFiles, sisCode);
      
      PdfFiles.forEach(pdf => URL.revokeObjectURL(pdf.url));
      alert('Archivo enviado con éxito');
      setPdfFile(null);
      setSisCode('');
      setStep(1);
    } catch (error) {
      
      console.error('Error:', error);
    } finally {
      setIsConverting(false);
    }
  };

  useEffect(() => {
    return () => {
      PdfFiles.forEach(pdf => {
        if (pdf.url) URL.revokeObjectURL(pdf.url);
      });
    };
  }, [PdfFiles]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Conversor de Archivos</h1>
      
      {step === 1 && (
        <FileUploader onFileUpload={handleFileUpload} />
      )}

      {step === 2 && PdfFiles.length > 0 && (
        <div className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
          <div className="md:col-span-1">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold mb-3">Materias generadas ({PdfFiles.length})</h2>
                <div className="max-h-96 overflow-y-auto">
                  {Object.entries(pdfsByCareer).map(([career, careerPdfs]) => (
                      <div key={career} className="mb-4">
                        <h3 className="font-bold text-md mb-2 p-2 bg-gray-100 rounded">
                          {career} ({careerPdfs.length})
                        </h3>
                        <ul className="space-y-1">
                          {careerPdfs.map((pdf, index) => (
                            <li 
                              key={index}
                              className={`p-2 rounded cursor-pointer text-sm ${
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
              </div>
            </div>

            <div className="md:col-span-2">
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

            <SubmitForm 
              sisCode={sisCode} 
              setSisCode={setSisCode} 
              onSubmit={handleSubmit} 
            />
          </div>
        </div>
      )}

      <ConversionModal isOpen={isConverting} />
    </div>
  );
}

export default FileConverterPage;