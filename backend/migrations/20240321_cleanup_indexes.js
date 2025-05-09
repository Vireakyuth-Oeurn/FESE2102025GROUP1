'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get the query interface
    const [results] = await queryInterface.sequelize.query(
      `SHOW INDEX FROM users;`
    );
    
    console.log('Current indexes:', results);
    
    // Remove any duplicate or unnecessary indexes
    const indexesToRemove = results
      .filter(index => index.Key_name !== 'PRIMARY')  // Keep primary key
      .map(index => index.Key_name);
    
    for (const indexName of indexesToRemove) {
      try {
        await queryInterface.sequelize.query(
          `DROP INDEX \`${indexName}\` ON users;`
        );
        console.log(`Removed index: ${indexName}`);
      } catch (error) {
        console.log(`Failed to remove index ${indexName}:`, error.message);
      }
    }
    
    // Add back only the essential indexes
    await queryInterface.addIndex('users', ['username'], {
      unique: true,
      name: 'users_username_unique'
    });
    
    await queryInterface.addIndex('users', ['email'], {
      unique: true,
      name: 'users_email_unique'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the new indexes
    try {
      await queryInterface.removeIndex('users', 'users_username_unique');
      await queryInterface.removeIndex('users', 'users_email_unique');
    } catch (error) {
      console.log('Error removing indexes:', error.message);
    }
  }
}; 