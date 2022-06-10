const mysql = require('mysql2');

const pool = mysql.createPool({
	host: 'localhost',
	user: 'root',
	database: 'first-sql-db',
	password: 'adminroot',
});

module.exports = pool.promise();
