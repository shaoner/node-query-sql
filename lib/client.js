var mysql = require('mysql');
var Query = require('./query');

/**
 * A mysql client
 *
 * @constructor
 * @param {Object<string,string>} config The mysql configuration
 */
var Client = function(config) {
	this.pool = mysql.createPool(config);
	// Directly extends Query object
	// This is risky but this keeps client and query object coherent
	// Moreover this is less code to maintain
	var self = this;
	for (var prop in Query) {
		(function(prop) {
			// This allows to call Query functions through the Client class
			// Client.<query_method>(connection, ..., callback);
			self[prop] = function() {
				var args = Array.prototype.slice.call(arguments);
				var connection = args.shift();
				var callback = args.pop();
				var query = Query[prop].apply(null, args);
				connection.query(query.statement, query.args, callback);
			};
			// Same methods with 'p' prefix (that stands for 'pool')
			// In this case, the connection is got from the pool
			// Client.p<query_method>(..., callback);
			self['p' + prop] = function() {
				var callback = arguments[arguments.length - 1];
				var query = Query[prop].apply(null, arguments);
				self.pool.getConnection(function(err, connection) {
					if (err)
						return callback(err);
					connection.query(query.statement, query.args, function(err, res) {
						connection.release();
						callback(err, res);
					});
				});
			};
		})(prop);
	}
	this.query = this.raw;
	this.pquery = this.praw;
};

/**
 * Run multiple queries at once
 * To use it, you have to explicitly enable multipleStatements in the config
 * However this is not always recommanded
 *
 * @param {mysql.Connection} connection
 * @param {Array.Query} queries
 * @param {Function} callback
 */
Client.prototype.multi = function(connection, queries, callback) {
	var statement = 'BEGIN';
	var args = [];
	for (var i = 0, len = queries.length; i < len; ++i) {
		var query = queries[i];
		statement += ';' + query.statement;
		args = args.concat(query.args);
	}
	statement += ';END;';
	connection.query(statement, args, callback);
};

/**
 * Run multiple queries at once using a connection from the pool
 * To use it, you have to explicitly enable multipleStatements in the config
 * However this is not always recommanded
 *
 * @param {Array.Query} queries
 * @param {Function} callback
 */
Client.prototype.pmulti = function(queries, callback) {
	var self = this;
 	this.pool.getConnection(function(err, connection) {
 		if (err)
 			return callback(err);
		self.multi(connection, queries, function(err, res) {
			connection.release();
			callback(err, res);
		});
 	});
};

/**
 * Run recursively each request from a transaction
 *
 * @private
 * @param {mysql.Connection} connection
 * @param {Array.Query} queries
 * @param {Function} callback
 */
Client.prototype._recTransaction = function(connection, queries, callback) {
	var self = this;
	var query = queries.shift();
	connection.query(query.statement, query.args, function(err, res) {
		if (err) {
			connection.query('ROLLBACK');
			return callback(err, res);
		}
		if (query.affect && res.affectedRows === 0) {
			connection.query('ROLLBACK');
			return callback('No affected rows: ' + query.statement);
		}
		if (queries.length > 0)
			self._recTransaction(connection, queries, callback);
		else
			connection.query('COMMIT', callback);
	});
};

/**
 * Starts a transaction
 *
 * @param {mysql.Connection} connection
 * @param {Array.Query} queries
 * @param {Function} callback
 */
Client.prototype.transaction = function(connection, queries, callback) {
	var self = this;
	connection.query('START TRANSACTION', function(err) {
		self._recTransaction(connection, queries, callback);
	});
};

/**
 * Starts a transaction with a connection from the pool
 *
 * @param {Array.Query} queries
 * @param {Function} callback
 */
Client.prototype.ptransaction = function(queries, callback) {
	var self = this;
	this.pool.getConnection(function(err, connection) {
		if (err)
			return callback(err);
		self.transaction(connection, queries, function(err, res) {
			connection.release();
			callback(err, res);
		});
	});
};

module.exports = Client;
