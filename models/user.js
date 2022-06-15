const mongoDB = require('mongodb');
const { getDB } = require('../util/base-of-data');

class User {
	constructor(email, username, password) {
		this.username = username;
		this.password = password;
		this.email = email;
	}

	save() {
		const db = getDB();
		return db
			.collection('users') //? users is our accounts table
			.insertOne(this); //? this is the just created object
	}

	static findById(userID) {
		const db = getDB();
		return db.collection('users').findOne({ _id: new mongoDB.ObjectId(userID) });
	}
}

module.exports = User;
