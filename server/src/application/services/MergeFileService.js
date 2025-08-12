import globalPlan from "../../infraestructure/db/models/globalplan.js";
import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import KardexError from "../../interface/error/kardexErrors.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../../')

class MergeFilesService {

  async mergePdfs(requestPdf, existingPdfPath) {
    
    try {
      const [requestPdfBytes, existingPdfBytes] = await Promise.all([
        requestPdf,
        fs.readFile(path.join(projectRoot, existingPdfPath))
      ]);

      const [requestDoc, existingDoc] = await Promise.all([
        PDFDocument.load(requestPdf),
        PDFDocument.load(existingPdfBytes)
      ]);

      const mergedPdf = await PDFDocument.create();
      const pagesRequest = await mergedPdf.copyPages(requestDoc, requestDoc.getPageIndices());
      pagesRequest.forEach(page => mergedPdf.addPage(page));
      const pagesExisting = await mergedPdf.copyPages(existingDoc, existingDoc.getPageIndices());
      pagesExisting.forEach(page => mergedPdf.addPage(page));

      return await mergedPdf.save();
    } catch (error) {
      throw KardexError.kardexProcessingError({
        operation: "merge_pdfs",
        details: `Error al fusionar PDFs: ${error.message}`,
        existingPdfPath
      });
    }
  }

  async processFiles(files) {
    const processedFiles = [];
    
    for (const file of files) {
      try {
        if (!file.subject) {
          throw KardexError.badRequest(
            "El campo 'subject' es requerido para cada archivo",
            { filename: file.filename },
            "MISSING_SUBJECT_FIELD"
          );
        }

        const baseName = file.subject
        const materia = await globalPlan.findOne({
          where: { 
            materia: baseName 
          }
        });

        if (!materia) {
          throw KardexError.notFound(
            `No se encontró la materia '${baseName}' en el plan global`,
            { subject: baseName },
            "SUBJECT_NOT_FOUND"
          );
        }

        if (!materia.path) {
          throw KardexError.internal(
            `La materia '${baseName}' no tiene un path definido`,
            { materiaId: materia.id },
            "MISSING_SUBJECT_PATH"
          );
        }

        const existingPdfPath = materia.path;
        const mergedPdf = await this.mergePdfs(file.blob, existingPdfPath);

        processedFiles.push({
          originalFilename: file.filename,
          mergedFilename: `${baseName}.pdf`,
          blob: mergedPdf,
          path: file.path,
          status: 'merged',
          materiaId: materia.id
        });

      } catch (error) {
        if (error instanceof KardexError) {
          throw error; 
        }
        
        throw KardexError.kardexProcessingError({
          operation: "process_files",
          filename: file.filename,
          details: error.message,
          errorCode: "PDF_PROCESSING_ERROR"
        });
      }
    }

    if (processedFiles.length === 0) {
      throw KardexError.kardexProcessingError(
        "No se pudo procesar ningún archivo",
        { totalFiles: files.length },
        "NO_FILES_PROCESSED"
      );
    }
    
    return processedFiles;
  }
}

export default  new MergeFilesService();