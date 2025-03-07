import student from "../../infraestructure/db/models/Student.js";

class StudentsService {

    /**
     * @param {string} sisCode 
     * @returns {boolean} 
     */
    async veryfyStudentInDB(sisCode){
        return await student.findOne({where: {codSIS: sisCode}});
    }
}

export default new StudentsService();