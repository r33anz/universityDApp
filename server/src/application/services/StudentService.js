import student from "../../infrastructure/db/models/student.js";

class StudentsService {

    /**
     * @param {string} sisCode
     * @returns {boolean}
     */
    async verifyStudentInDB(sisCode){
        return await student.findOne({where: {codSIS: sisCode}});
    }

    /*
     * @param {string} sisCode 
     * @returns {boolean} 
    */ 
    // NOTE: The `hasCredential` column was created as VARCHAR by the migration
    // 20250312030825-add-newField-to-students (the Sequelize model declares it as
    // BOOLEAN, but `sequelize.sync({force:false})` never altered the live schema).
    // Until a migration converts it to BOOLEAN, queries MUST use the string
    // literal 'true' / 'false', otherwise Postgres throws
    // "operator does not exist: character varying = boolean".
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