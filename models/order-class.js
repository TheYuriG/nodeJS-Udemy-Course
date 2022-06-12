const Sequelize = require('sequelize');

const seq = require('../util/base-of-data');

const Order = seq.define('order', {
	id: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		allowNull: false,
		primaryKey: true,
	},
	units: Sequelize.INTEGER,
});

module.exports = Order;
