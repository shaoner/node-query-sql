var mysql = require('mysql');

/**
 * A query builder
 *
 * @constructor
 */
var Query = function() {
	this.statement = null;
	this.values = [ ];
};

/**
 * Build a string with placeholders and the relative values
 * @param {Object<string, (string|number|boolean)>} hash
 * @param {string} values
 * @return {string}
 */
Query.prototype.hashToClause = function(hash, separator) {
    var placeholder = '';
    var first = true;
    for (var key in hash) {
        placeholder += (first ? '' : separator) + key + ' = ?';
        this.values.push(hash[key]);
        first = false;
    }
    return placeholder;
};

/**
 * Build a select query
 *
 * @param {Array.<string>|string} fields
 * @param {string} table
 * @return {Query}
 */
Query.select = function(fields, table) {
	if (arguments.length < 2)
		throw new Error('Missing arguments');
	if (Array.isArray(fields))
		fields = fields.join(',');
	else
		fields = fields;
	var q = new Query();
	q.statement = 'SELECT ' + fields + ' FROM ??';
	q.values.push(table);
	return q;
};

/**
 * Build an insert query
 *
 * @param {string} table
 * @param {Object.<string, (string|number|boolean)>} fields
 * @return {Query}
 */
Query.insert = function(table, fields) {
	if (arguments.length < 2)
		throw new Error('Missing arguments');
	var q = new Query();
	q.values.push(table);
	q.statement = 'INSERT INTO ?? SET ' + q.hashToClause(fields, ',');
	return q;
};

/**
 * Build an update query
 *
 * @param {string} table
 * @param {Object.<string, (string|number|boolean)>} fields
 * @return {Query}
 */
Query.update = function(table, fields) {
	if (arguments.length < 2)
		throw new Error('Missing arguments');
	var q = new Query();
	q.values.push(table);
	q.statement = 'UPDATE ?? SET ' + q.hashToClause(fields, ',');
	return q;
};

/**
 * Build a select count query
 *
 * @param {string} table
 * @return {Query}
 */
Query.count = function(table) {
	if (arguments.length < 1)
		throw new Error('Missing arguments');
	var q = new Query();
	q.statement = 'SELECT COUNT(*) as count FROM ??';
	q.values.push(table);
	return q;
};

/**
 * Build a delete query
 *
 * @param {string} table
 * @return {Query}
 */
Query.delete = function(table) {
	if (arguments.length < 1)
		throw new Error('Missing arguments');
	var q = new Query();
	q.statement = 'DELETE FROM ??';
	q.values.push(table);
	return q;
};

/**
 * Append a WHERE IN clause using the query to this query
 *
 * @param {string} field
 * @param {Query|string}
 * @return {Query}
 */
Query.prototype.whereIn = function(field, query) {
	if (arguments.length < 2)
		throw new Error('Missing arguments');
	if (this.statement == null)
		throw new Error('Missing statement');
	this.statement += ' WHERE ' + field + ' IN (';
	if (typeof query == 'string')
		this.statement += query + ')';
	else {
		this.values = this.values.concat(query.values);
		this.statement += query.statement + ')';
	}
	return this;
};

/**
 * Append a WHERE clause to this query
 *
 * @param {Object<string, (string|number|boolean)>|string} condition
 * @return {Query}
 */
Query.prototype.where = function(condition) {
	if (arguments.length < 1)
		throw new Error('Missing arguments');
	if (this.statement == null)
		throw new Error('Missing statement');
	this.statement += ' WHERE ';
	if (typeof condition == 'string')
		this.statement += condition;
	else
		this.statement += this.hashToClause(condition, ' AND ');
	return this;
};

/**
 * Append a INNER JOIN clause to this query
 *
 * @param {string} table
 * @param {Object<string, (string|number|boolean)>|string} condition
 * @return {Query}
 */
Query.prototype.innerJoin = function(table, condition) {
	if (arguments.length < 2)
		throw new Error('Missing arguments');
	if (this.statement == null)
		throw new Error('Missing statement');
	this.values.push(table);
	this.statement += ' INNER JOIN ?? ON ';
	if (typeof condition == 'string')
		this.statement += condition;
	else
		this.statement += this.hashToClause(condition, ' AND ');
	return this;
};

Query.prototype.join = Query.prototype.innerJoin;

/**
 * Append an ORDER BY clause to this query
 *
 * @param {string} by
 * @param {boolean=} desc
 * @return {Query}
 */
Query.prototype.orderby = function(by, desc) {
	if (arguments.length < 1)
		throw new Error('Missing arguments');
	if (this.statement == null)
		throw new Error('Missing statement');
	this.statement += ' ORDER BY ' + by + (desc ? ' DESC' : ' ASC');
	return this;
};

/**
 * Append an LIMIT clause to this query
 *
 * @param {number=} offset
 * @param {number} lines
 * @return {Query}
 */
Query.prototype.limit = function(offset, lines) {
	if (arguments.length < 1)
		throw new Error('Missing arguments');
	if (this.statement == null)
		throw new Error('Missing statement');
	this.statement += ' LIMIT ' + offset;
	if (arguments.length != 1)
		this.statement += ',' + lines;
	return this;
};

/**
 * Append a statement to this query statement
 *
 * @param {string} statement
 * @param {Array.<(string|number|boolean)>=} desc
 * @return {Query}
 */
Query.prototype.append = function(statement, values) {
	if (arguments.length < 1)
		throw new Error('Missing arguments');
	this.statement += ' ' + statement;
	if (values)
		this.values.push(values);
	return this;
};

/**
 * Return the formatted final query
 *
 * @return {string}
 */
Query.prototype.toString = function() {
	return mysql.format(this.statement, this.values);
};

/**
 * Execute the query, and call cb
 *
 * @param {mysql.Connection} connection
 * @param {Function=} cb
 */
Query.prototype.exec = function(connection, cb) {
	if (arguments.length < 1)
		throw new Error('Missing arguments');
	connection.query(this.statement, this.values, cb);
};

module.exports = Query;
