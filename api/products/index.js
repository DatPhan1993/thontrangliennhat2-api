const { readDatabase } = require('../../database-utils');

module.exports = (req, res) => {
  const db = readDatabase();
  const products = db.products || [];
  
  res.json(products);
}; 