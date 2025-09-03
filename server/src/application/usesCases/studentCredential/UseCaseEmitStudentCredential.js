import StudentService from "../../services/StudentService.js"
import StudentSerror from "../../../interface/error/studentErrors.js";
import CredentilaManagementService from "../../services/CredentilaManagementService.js";

class UseCaseEmitStudentCredential{

    async emitCredential(sisCode){
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
                await CredentilaManagementService.emitCredential(student.codSIS);
                
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

export default new UseCaseEmitStudentCredential();