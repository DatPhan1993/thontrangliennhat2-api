const { readDatabase } = require('../../database-utils');

module.exports = (req, res) => {
  const db = readDatabase();
  const news = db.news || [];
  
  res.json(news);
}; 