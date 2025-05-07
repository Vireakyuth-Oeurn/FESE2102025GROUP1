const app = require('./app');
const { sequelize } = require('./models');
const PORT = process.env.PORT || 5000;

// Test database connection
sequelize.authenticate()
  .then(() => {
    console.log('Connected to MySQL database');
    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
  }); 