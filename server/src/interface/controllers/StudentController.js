import UseCaseEmitStudentCredential from "../../application/useCases/studentCredential/UseCaseEmitStudentCredential.js";
import StudentService from "../../application/services/StudentService.js";
import StudentError from "../error/studentErrors.js";

class StudentController {
    async verifyStudentInDB(req, res, next) {
        try {
            const { SISCode } = req.body;
            if (!SISCode) throw StudentError.badRequest("El código SIS es requerido");

            const student = await UseCaseEmitStudentCredential.emitCredential(SISCode);
            res.status(200).json(student);
        } catch (e) { next(e); }
    }

    async verifyStudentByWallet(req, res, next) {
        try {
            const { walletAddress } = req.params;
            if (!walletAddress) throw StudentError.badRequest("La dirección de wallet es requerida");

            const data = await UseCaseEmitStudentCredential.verifyByWallet(walletAddress);
            res.status(200).json({ success: true, data });
        } catch (e) { next(e); }
    }

    /**
     * Read-only status check used by the frontend on input-blur. Lets the UI
     * tell the admin "este estudiante ya tiene credencial" without paying the
     * cost of the full emission round-trip.
     */
    async studentStatus(req, res, next) {
        try {
            const { sisCode } = req.params;
            if (!sisCode) throw StudentError.badRequest("El código SIS es requerido");

            const student = await StudentService.verifyStudentInDB(sisCode);
            if (!student) {
                return res.status(200).json({ exists: false, hasCredential: false });
            }
            // The live column is VARCHAR (see StudentService note for IM-6).
            // Sequelize usually coerces to boolean, but accept either shape.
            const hasCredential = student.hasCredential === true || student.hasCredential === 'true';
            res.status(200).json({ exists: true, hasCredential });
        } catch (e) { next(e); }
    }
}

export default new StudentController();
