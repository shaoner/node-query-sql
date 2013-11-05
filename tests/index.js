const MYSQL_HOST = process.env.MYSQL_HOST || 'localhost';
const MYSQL_PORT = process.env.MYSQL_PORT || 3306;
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || 'test';
const MYSQL_USER = process.env.MYSQL_USER || 'root';
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || '';

var MysqlClient = require('../lib').Client;
var Query = require('../lib').Query;
var mysql = require('mysql');

function createConnection(config) {
	var c = mysql.createConnection(config);
//	c.connect();
	return c;
}

function createTable(connection, table) {
	console.log('Try to create table ' + table);
	connection.query("TRUNCATE TABLE " + table, function(err, res) {
		if (err)
			throw err;
	});
	connection.query("CREATE TABLE IF NOT EXISTS `" + MYSQL_DATABASE + "`.`" + table + "` (`id` INT UNSIGNED NOT NULL AUTO_INCREMENT , `nickname` VARCHAR(20) NOT NULL , `email_address` VARCHAR(255) NOT NULL , `password` VARCHAR(40) NOT NULL , `photo` VARCHAR(100) NULL DEFAULT NULL , `signup_date` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP , `enabled` TINYINT(1) NULL DEFAULT 1 , PRIMARY KEY (`id`) )", [], function(err, res) {
		if (err) {
			console.log('Failed to create table ' + table);
			console.log(err);
			throw err;
		}
	});
}

var config = {
	host: MYSQL_HOST,
	port: MYSQL_PORT,
	user: MYSQL_USER,
	password: MYSQL_PASSWORD,
	database: MYSQL_DATABASE
};

var USERS_TABLE = 'mysql_ext_users';

var client = new MysqlClient(config);

var connection = createConnection(config);

// Create some test tables
createTable(connection, USERS_TABLE);

// Inserts some elements
var users = [ ];
for (var i = 0; i < 10; ++i) {
	(function(name) {
		users.push({
			nickname: name,
			email_address: name + '@mail.com',
			password: Math.random() * 100000 + '',
			photo: '/photo/' + name + '.png',
			enabled: true
		});
	})('user' + i);
}

client.insert(connection, USERS_TABLE, users[0], function(err, res) {
	if (err || res.affectedRows == 0) {
		console.log('Fail to insert user0');
		console.log(err);
		console.log(res);
	} else
		console.log(res);
});

client.pinsert(USERS_TABLE, users[1], function(err, res) {
	if (err || res.affectedRows == 0) {
		console.log('Fail to insert user1');
		console.log(err);
		throw err;
	}
	client.pselect(USERS_TABLE, [ 'id', 'nickname' ], function(err, res) {
		if (err) {
			console.log('Fail to select');
			console.log(err);
			throw err;
		}
		console.log(res);
	});
	client.pselectW(USERS_TABLE, [ 'id', 'nickname' ], { id: 1 }, function(err, res) {
		if (err) {
			console.log('Fail to select');
			console.log(err);
			throw err;
		}
		console.log(res);
	});

});

client.ptransaction([
	Query.insert(USERS_TABLE, users[2]),
	Query.insert(USERS_TABLE, users[3]),
	Query.insert(USERS_TABLE, users[4]),
	Query.update(USERS_TABLE, { nickname: 'user_updated' }, { id: 4 })
], function(err) {
	if (err)
		throw err;
	console.log('transaction ok');
});

connection.end();
