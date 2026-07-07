import UseCaseKardexRequest from "../../application/useCases/kardex/UseCaseKardexRequest.js";
import KardexError from "../error/kardexErrors.js";
import StudentService from "../../application/services/StudentService.js";
import StudentError from "../error/studentErrors.js";
import NotificationService from "../../application/services/NotificationService.js";

class PdfController {
    async uploadFile(req, res, next) {
        try {
            if (!req.files || req.files.length === 0) {
                throw KardexError.fileUploadRequired();
            }

            const sisCode = req.body.sisCode;
            if (!sisCode) throw KardexError.badRequest("El código SIS es requerido");

            const student = await StudentService.verifyStudentInDB(sisCode);
            if (!student) {
                throw StudentError.notFound(
                    "Código SIS no encontrado",
                    { sisCode },
                    "STUDENT_NOT_FOUND"
                );
            }

            const studentAskKardex = await NotificationService.studentAskedKardex(sisCode);
            if (!studentAskKardex) {
                throw KardexError.badRequest(
                    "El estudiante no ha solicitado el envío de su kardex.",
                );
            }

            // Normalize array-typed body fields: multer sends a single string
            // when only one value is uploaded and a real array when multiple.
            const asArr = (v) => (v == null ? [] : [].concat(v));
            const careers   = asArr(req.body.careers);
            const subjects  = asArr(req.body.subject);
            const notas     = asArr(req.body.notas);
            const creditos  = asArr(req.body.creditos);
            const gestiones = asArr(req.body.gestiones);
            const studentName = req.body.studentName ?? '';

            const files = req.files.map((file, i) => ({
                blob: file.buffer,
                filename: file.originalname.normalize('NFD').replace(/[̀-ͯ]/g, ""),
                path: `/${req.body.sisCode}/${careers[i]}/`,
                career:   careers[i],
                subject:  subjects[i],
                nota:     notas[i],
                creditos: creditos[i],
                gestion:  gestiones[i],
                studentName,
                sisCode,
            }));

            const invalidFiles = files.filter(file => !file.filename.toLowerCase().endsWith('.pdf'));
            if (invalidFiles.length > 0) {
                throw KardexError.invalidFileFormat({
                    invalidFiles: invalidFiles.map(f => f.filename),
                });
            }

            const result = await UseCaseKardexRequest.uploadingKardexToIPFS(files);
            return res.status(result ? 201 : 401).json({ success: !!result });
        } catch (e) { next(e); }
    }
}

export default new PdfController();
