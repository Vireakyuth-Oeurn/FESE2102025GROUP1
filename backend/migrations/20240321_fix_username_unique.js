'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if the index exists
      const [indexes] = await queryInterface.sequelize.query(
        `SHOW INDEX FROM users WHERE Key_name = 'users_username_unique';`
      );
      
      if (indexes.length > 0) {
        // Remove the existing index if it exists
        await queryInterface.sequelize.query(
          `ALTER TABLE users DROP INDEX users_username_unique;`
        );
      }
      
      // Add the unique index
      await queryInterface.addIndex('users', ['username'], {
        unique: true,
        name: 'users_username_unique'
      });
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Check if the index exists
      const [indexes] = await queryInterface.sequelize.query(
        `SHOW INDEX FROM users WHERE Key_name = 'users_username_unique';`
      );
      
      if (indexes.length > 0) {
        // Remove the index if it exists
        await queryInterface.sequelize.query(
          `ALTER TABLE users DROP INDEX users_username_unique;`
        );
      }
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  }
}; 