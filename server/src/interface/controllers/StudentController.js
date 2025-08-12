import UseCaseEmmitStudentCredential from "../../application/usesCases/studentCredential/UseCaseEmmitStudentCredential.js";
import StudentSerror from "../error/studentErrors.js";

class StudentController{
    async veryfyStudentInDB(req, res){
        try {
            const {SISCode} = req.body;
            if (!SISCode) {
                throw new StudentSerror("El código SIS es requerido", 400)
              }
            const student =    
                await UseCaseEmmitStudentCredential.emmitCredential(SISCode);
            res.status(200).json(student);
        } catch (error) {

            if (error instanceof StudentSerror) {
              return res.status(error.statusCode).json({
                success: false,
                message: error.message,
                details: error.details,
                errorCode: error.errorCode,
              })
            }      

            res.status(500).json({
                success: false,
                message: "Error interno del servidor",
                details: process.env.NODE_ENV === "development" ? error.message : null,
            })
        }
    }
}

export default new StudentController();