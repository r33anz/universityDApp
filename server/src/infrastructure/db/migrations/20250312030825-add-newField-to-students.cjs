'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Students', 'hasCredential', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: false
    });
  },
  
  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('students', 'hasCredential');
  }
};