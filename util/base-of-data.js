const Sequelize = require('sequelize');

const seq = new Sequelize('first-sql-dn', 'root', 'adminroot', { dialect: 'mysql', host: 'localhost' });

module.exports = seq;
