import { Router } from "express";
import PdfController from "../controllers/PdfController.js";
import multer from "multer";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 20 // Máximo 20 archivos
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF'), false);
    }
  }
});


router.post("/upload_multiple_pdfs", upload.array('files'), PdfController.uploadFile);
export default router;