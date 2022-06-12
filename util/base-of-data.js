const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const mongoConnect = (mongoConnectionCallback) => {
	MongoClient.connect(
		'mongodb+srv://NodeJS-course:tozY1rQ8LktyZETy@nodejs-tutorial.nsxgg.mongodb.net/?retryWrites=true&w=majority'
	)
		.then((client) => {
			console.log('Connected to MongoDB servers!');
			mongoConnectionCallback(client);
		})
		.catch((error) => console.log(error));
};

module.exports = mongoConnect;

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
