'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Students', [
      {
        codSIS: '202000421',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        codSIS: '202000422',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        codSIS: '202000423',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        codSIS: '202000424',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        codSIS: '202000425',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        codSIS: '202000426',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        codSIS: '202000427',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        codSIS: '202000420',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        codSIS: '202000430',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        codSIS: '202000431',
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
