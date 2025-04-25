'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Students', [
      {
        codSIS: '20190010',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        codSIS: '20190009',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        codSIS: '20190008',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        codSIS: '20190007',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        codSIS: '20190006',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        codSIS: '20190005',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        codSIS: '20190004',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        codSIS: '20190003',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        codSIS: '20190002',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        codSIS: '20190001',
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
