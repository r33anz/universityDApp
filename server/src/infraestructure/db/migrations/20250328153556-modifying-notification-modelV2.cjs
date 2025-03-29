'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Notifications', 'title', {
      type: Sequelize.STRING(25),
      allowNull: true 
    });

    await queryInterface.changeColumn('Notifications', 'status', {
      type: Sequelize.STRING(20),
      allowNull: true 
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
