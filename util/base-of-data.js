const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (mongoConnectionCallback) => {
	MongoClient.connect(
		'mongodb+srv://NodeJS-course:tozY1rQ8LktyZETy@nodejs-tutorial.nsxgg.mongodb.net/shop?retryWrites=true&w=majority'
	)
		.then((client) => {
			console.log('Connected to MongoDB servers!');
			_db = client.db();
			mongoConnectionCallback(client);
		})
		.catch((error) => {
			console.log(error);
			throw error;
		});
};

const getDB = () => {
	if (_db) {
		return _db;
	}
	throw 'No database found!';
};

module.exports = { mongoConnect: mongoConnect, getDB: getDB };
