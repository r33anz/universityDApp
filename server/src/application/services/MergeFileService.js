import globalPlan from "../../infraestructure/db/models/globalplan.js";
import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

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
      throw new Error(`Error merging PDFs: ${error.message}`);
    }
  }

  async processFiles(files) {
    const processedFiles = [];
    
    for (const file of files) {
      try {
        const baseName = file.subject
        const materia = await globalPlan.findOne({
          where: { 
            materia: baseName 
          }
        });
        
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
        console.error(`Error processing file ${file.filename}:`, error);
      }
    }

    return processedFiles;
  }
}

export default  new MergeFilesService();