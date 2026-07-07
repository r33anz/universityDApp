import apiClient from '../../../shared/lib/apiClient';

/**
 * Uploads the per-subject PDFs together with the structured student/grade
 * data. The backend uses the data fields to render the official cover page
 * itself — the request PDFs are kept only as proof-of-source and are NOT
 * appended to the final merged document anymore.
 */
const uploadMultiplePdfsWithSisCode = async (pdfFiles, sisCode, studentName, { onProgress } = {}) => {
  const formData = new FormData();

  pdfFiles.forEach((pdf) => {
    formData.append('files',     pdf.blob, pdf.filename);
    formData.append('careers',   pdf.career);
    formData.append('subject',   pdf.subject);
    formData.append('notas',     pdf.nota     ?? '');
    formData.append('creditos',  pdf.creditos ?? '');
    formData.append('gestiones', pdf.gestion  ?? '');
  });

  formData.append('sisCode',     sisCode);
  formData.append('studentName', studentName ?? '');
  formData.append('totalFiles',  pdfFiles.length.toString());

  const response = await apiClient.post("/api/upload_multiple_pdfs", formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress
      ? (e) => onProgress(Math.round((e.loaded * 100) / (e.total || 1)))
      : undefined,
  });
  return response.data;
};

export { uploadMultiplePdfsWithSisCode };
