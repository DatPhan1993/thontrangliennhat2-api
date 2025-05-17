const { readDatabase } = require('../../database-utils');

module.exports = (req, res) => {
  const db = readDatabase();
  const experiences = db.experiences || [];
  
  res.json(experiences);
}; 