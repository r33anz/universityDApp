import UseCaseKardexRequest from "../../application/usesCases/kardex/UseCaseKardexRequest.js";
import KardexError from "../error/kardexErrors.js";
import StudentService from "../../application/services/StudentService.js";
import StudentSerror from "../error/studentErrors.js";
import NotificationService from "../../application/services/NotificationService.js";

class PdfController{

    async uploadFile(req,res){
        try {
          if (!req.files || req.files.length === 0) {
            throw new KardexError.fileUploadRequired();
          }

          const sisCode = req.body.sisCode;

          if (!sisCode) {
            throw new KardexError("El código SIS es requerido", 400);
          }

          const student = await StudentService.veryfyStudentInDB(sisCode);
          if(!student){
            throw StudentSerror.notFound(
              "Código SIS no encontrado",
              { sisCode }, 
              "STUDENT_NOT_FOUND"
            );
          }

          const studentAskKardex = await NotificationService.studentsAskKardex(sisCode);
          if (!studentAskKardex) {
            throw KardexError.badRequest(
               "El estudiante no ha solicitado el envío de su kardex.",);
          }

          const files = req.files.map((file, i) => ({
            blob: file.buffer,
            filename: file.originalname.normalize('NFD').replace(/[\u0300-\u036f]/g, ""),
            path: `/${req.body.sisCode}/${req.body.careers[i]}/`, 
            career: req.body.careers[i],
            subject: req.body.subject[i],
            sisCode: sisCode,
          }));
          
          const invalidFiles = files.filter(file => !file.filename.toLowerCase().endsWith('.pdf'));
            if (invalidFiles.length > 0) {
                throw KardexError.invalidFileFormat({
                    invalidFiles: invalidFiles.map(f => f.filename)
                });
            }
 
          const result = await UseCaseKardexRequest.uploadingKardexToIPFS(files);
          if (result){
            return res.status(201).json({
            success: true
          });
          }else{
            return res.status(401).json({
            success: false
          });
          }
          
            
        } catch (error) {
          console.error('Error en PDF Controller:', error);
          
          if (error instanceof StudentSerror) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
                details: error.details,
                errorCode: error.errorCode,
            });
         }

          if (error instanceof KardexError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
                details: error.details,
                errorCode: error.errorCode,
            });
          }

          return res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            details: process.env.NODE_ENV === "development" ? error.message : null,
            errorCode: "INTERNAL_SERVER_ERROR"
          });
        }
    }
}

export default new PdfController();