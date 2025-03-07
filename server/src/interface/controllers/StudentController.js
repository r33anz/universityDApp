import StudentService from "../../application/services/StudentService.js";

class StudentController{
    async veryfyStudentInDB(req, res){
        console.log("verify",req.body);
        try {
            const {SISCode} = req.body;
            const student = await StudentService.veryfyStudentInDB(SISCode);

            if(student){
                res.status(200).send({
                    id: student.id,
                    codSIS: student.codSIS
                });
            }
            else{
                res.status(404).send("Estudiante no encontrado");
            }
        } catch (error) {
            console.error(error);
            res.status(500).send("Error en el servidor");       
        }
    }
}

export default new StudentController();