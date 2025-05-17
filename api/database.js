const { readDatabase, syncDatabase } = require('../database-utils');

// Read database
const getDatabase = () => {
  return readDatabase();
};

// Write database
const writeDatabase = (data) => {
  return syncDatabase(data);
};

module.exports = {
  getDatabase,
  writeDatabase
}; 