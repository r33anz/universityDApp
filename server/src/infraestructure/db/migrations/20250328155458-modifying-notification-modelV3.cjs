'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Notifications', 'status', {
      type: Sequelize.STRING(20),
      allowNull: true,
      defaultValue: "not_attended"
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
