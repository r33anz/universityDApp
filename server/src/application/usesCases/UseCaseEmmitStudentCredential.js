import StudentService from "../services/StudentService.js";
import CredentialManagement from "../../infraestructure/blockchain/contracts/CredentialManagement.js"; 

class UseCaseEmmitStudentCredential{

    async emmitCredential(sisCode){
        const student = await StudentService.veryfyStudentInDB(sisCode);

        if(student){
            try {
                const {mnemonic} = 
                    await CredentialManagement.emmitCredential(student.codSIS);
                return {
                    id: student.id,
                    codSIS: student.codSIS,
                    mnemonic: mnemonic
                };
            } catch (error) {
                console.error(error);
                throw new Error("Error en el servidor");
            }
        }
        else{
            throw new Error("Estudiante no encontrado");
        }
    }
}

export default new UseCaseEmmitStudentCredential();