import StudentService from "../../services/StudentService.js"
import CredentialManagement from "../../../infraestructure/blockchain/contracts/CredentialManagement.js"
import StudentSerror from "../../../interface/error/studentErrors/studentErrors.js";

class UseCaseEmmitStudentCredential{

    async emmitCredential(sisCode){
        const student = await StudentService.veryfyStudentInDB(sisCode);
        if(!student){
            throw StudentSerror.notFound(
                    "Código SIS no encontrado",
                    { sisCode }, 
                    "STUDENT_NOT_FOUND");
        }

        const hasCredential = await StudentService.hasCredential(sisCode);
        if (hasCredential) {
            throw StudentSerror.conflict(
                    "Ya se le asignó una credencial", 
                    { sisCode }, 
                    "CREDENTIAL_ALREADY_EXISTS")
        }
        
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
                throw StudentSerror.internal(
                    "Error emitiendo credencial", 
                    { sisCode }, 
                    "CREDENTIAL_EMISSION_ERROR");
            }
        
    }
}

export default new UseCaseEmmitStudentCredential();