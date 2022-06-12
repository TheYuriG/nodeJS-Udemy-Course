const Sequelize = require('sequelize');

const seq = require('../util/base-of-data');

const OrderItem = seq.define('orderItem', {
	id: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		allowNull: false,
		primaryKey: true,
	},
	quantity: Sequelize.INTEGER,
});

module.exports = OrderItem;
