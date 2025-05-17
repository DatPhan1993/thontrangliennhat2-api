const { readDatabase } = require('../../database-utils');

module.exports = (req, res) => {
  const db = readDatabase();
  const services = db.services || [];
  
  res.json(services);
}; 