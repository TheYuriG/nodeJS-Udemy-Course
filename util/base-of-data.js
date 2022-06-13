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

module.exports = { mongoConnect: mongoConnect, db: getDB };

// const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri =
// 	'mongodb+srv://NodeJS-course:tozY1rQ8LktyZETy@nodejs-tutorial.nsxgg.mongodb.net/?retryWrites=true&w=majority';
// const client = new MongoClient(uri, {
// 	useNewUrlParser: true,
// 	useUnifiedTopology: true,
// 	serverApi: ServerApiVersion.v1,
// });
// client.connect((err) => {
// 	const collection = client.db('test').collection('devices');
// 	// perform actions on the collection object
// 	client.close();
// });
