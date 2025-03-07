'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Students', [
      {
        codSIS: '202000321',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        codSIS: '202000322',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        codSIS: '202000323',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        codSIS: '202000324',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      ]);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
