import UseCaseEmmitStudentCredential from "../../application/usesCases/UseCaseEmmitStudentCredential.js";

class StudentController{
    async veryfyStudentInDB(req, res){
        try {
            const {SISCode} = req.body;
            const student =    
                await UseCaseEmmitStudentCredential.emmitCredential(SISCode);
            res.status(200).json(student);
        } catch (error) {
            console.error(error);
            res.status(500).send("Error en el servidor");       
        }
    }
}

export default new StudentController();