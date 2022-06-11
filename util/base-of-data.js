const Sequelize = require('sequelize');

const seq = new Sequelize('first-sql-dn', 'root', 'adminroot', { dialect: 'mysql', host: 'localhost', logging: false });

module.exports = seq;
