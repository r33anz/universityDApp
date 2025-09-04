import axios from 'axios';

const apiUrl = `${process.env.REACT_APP_API_PROTOCOL}://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}`;

const uploadPdfWithSisCode = async (pdfBlob, sisCode) => {
    const formData = new FormData();
    formData.append('pdf', pdfBlob, 'converted.pdf');
    formData.append('sisCode', sisCode);
    
    try {
      const response = await axios.post(`${apiUrl}/api/upload_pdf`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading PDF:', error);
      throw error;
    }
  };

  const uploadMultiplePdfsWithSisCode = async (pdfFiles, sisCode) => {
    const formData = new FormData();
    
    pdfFiles.forEach((pdf) => {
      formData.append('files', pdf.blob, pdf.filename);
      formData.append('careers', pdf.career); 
      formData.append('subject',pdf.subject)
    });
  
    formData.append('sisCode', sisCode);
    formData.append('totalFiles', pdfFiles.length.toString());
  
    try {
      const response = await axios.post(`${apiUrl}/api/upload_multiple_pdfs`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

export {uploadMultiplePdfsWithSisCode, uploadPdfWithSisCode}