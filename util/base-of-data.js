const mysql = require('mysql2');

const pool = mysql.createPool({
	host: 'localhost',
	user: 'root',
	database: 'first-sql-dn',
	password: 'adminroot',
});

module.exports = pool.promise();
