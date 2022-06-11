const Sequelize = require('sequelize');

const seq = require('../util/base-of-data');

const CartItem = seq.define('cartItem', {
	id: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		allowNull: false,
		primaryKey: true,
	},
	quantity: Sequelize.INTEGER,
});

module.exports = CartItem;
