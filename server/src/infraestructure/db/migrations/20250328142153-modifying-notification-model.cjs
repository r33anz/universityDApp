'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Notifications', {});

    await queryInterface.renameColumn('Notifications', 'emmittedAt', 'emittedAt');

    await queryInterface.renameColumn('Notifications', 'isAttended', 'status');

    await queryInterface.changeColumn('Notifications', 'title', {
      type: Sequelize.STRING(10),
      allowNull: true 
    });

    await queryInterface.changeColumn('Notifications', 'title', {
      type: Sequelize.STRING(25),
      allowNull: true 
    });

    await queryInterface.changeColumn('Notifications', 'message', {
      type: Sequelize.STRING(125),
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
