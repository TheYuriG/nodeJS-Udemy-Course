const Sequelize = require('sequelize');

const seq = require('../util/base-of-data');

const Cart = seq.define('cart', {
	id: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		allowNull: false,
		primaryKey: true,
	},
});

module.exports = Cart;
