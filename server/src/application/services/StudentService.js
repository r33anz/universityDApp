import student from "../../infraestructure/db/models/Student.js";

class StudentsService {

    /**
     * @param {string} sisCode 
     * @returns {boolean} 
     */
    async veryfyStudentInDB(sisCode){
        return await student.findOne({where: {codSIS: sisCode}});
    }

    /*
     * @param {string} sisCode 
     * @returns {boolean} 
    */ 
    async hasCredential(sisCode){
        return await student.findOne({where: {codSIS: sisCode, hasCredential: 'true'}});
    }

    /**
     * @param {string} sisCode 
     * @returns {boolean} 
     */ 
    async assignedCredential(sisCode){
        return await student.update({hasCredential: 'true'}, {where: {codSIS: sisCode}});
    }
}

export default new StudentsService();