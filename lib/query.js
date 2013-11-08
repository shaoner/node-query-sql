/**
 * Query builder
 */
var Query = { };

/**
 * Build a string with placeholders and the relative values
 * @return {Object<string, (string|Array.string)>}
 */
function hashToClause(hash, separator) {
    var result = '';
    var values = [];
    var first = true;
    for (var key in hash) {
        result += (first ? '' : separator) + key + ' = ?';
        values.push(hash[key]);
        first = false;
    }
    return { placeholder: result, values: values };
};

/**
 * Build a raw query
 *
 * @param {string} statement
 * @param {Array.<string>} args
 * @param {Boolean} affect Tell if this query should affect some rows
 * @returns {Object<string, (string|Array.string|boolean)>}
 */
Query.raw = function(statement, args, affect) {
	return { statement: statement, args: args, affect: affect };
};

/**
 * Count elements
 *
 * @param {string} table
 * @param {Object<string, string>} where Build a key = element condition
 * @returns {Object<string, (string|Array.string|boolean)>}
 */
Query.count = function(table, where) {
	var statement = 'SELECT COUNT(*) AS len FROM ' + table + ' WHERE ';
	var clause = hashToClause(where, ' AND ');
	statement += clause.placeholder;
	return { statement: statement, args: clause.values, affect: false };
};

/**
 * Select elements
 *
 * @param {string} table
 * @param {Array.string} fields
 * @returns {Object<string, (string|Array.string|boolean)>}
 */
Query.select = function(table, fields) {
	var cols = fields.join(',');
	var statement = 'SELECT ' + cols + ' FROM ' + table;
	return { statement: statement, args: [], affect: false };
};

/**
 * Select elements with a condition
 *
 * @param {string} table
 * @param {Array.string} fields
 * @param {Object<string, string>} where Build a key = element condition
 * @returns {Object<string, (string|Array.string|boolean)>}
 */
Query.selectW = function(table, fields, where) {
	var cols = fields.join(',');
	var clause = hashToClause(where, ' AND ');
	var statement = 'SELECT ' + cols + ' FROM ' + table + ' WHERE ' + clause.placeholder;
	return { statement: statement, args: clause.values, affect: false };
};

/**
 * Select elements and sort them
 *
 * @param {string} table
 * @param {Array.string} fields
 * @param {string} by Key to sort
 * @param {boolean|null} desc Inverse the order
 * @returns {Object<string, (string|Array.string|boolean)>}
 */
Query.orderby = function(table, fields, by, desc) {
	var sort = desc ? ' DESC' : '';
	var cols = fields.join(',');
	var statement = 'SELECT ' + cols + ' FROM ' + table + ' ORDER BY ' + by + sort;
	return { statement: statement, args: [], affect: false };
};

/**
 * Select elements with a condition and sort them
 *
 * @param {string} table
 * @param {Array.string} fields
 * @param {Object<string, string>} where Build a key = element condition
 * @param {string} by Key to sort
 * @param {boolean|null} desc Inverse the order
 * @returns {Object<string, (string|Array.string|boolean)>}
 */
Query.orderbyW = function(table, fields, where, by, desc) {
	var sort = desc ? ' DESC' : '';
	var cols = fields.join(',');
	var clause = hashToClause(where, ' AND ');
	var statement = 'SELECT ' + cols + ' FROM ' + table + ' WHERE ' + clause.placeholder + ' ORDER BY ' + by + sort;
	return { statement: statement, args: [], affect: false };
};

/**
 * Insert object
 *
 * @param {string} table
 * @param {Object<string, ?>} values The object to insert
 * @returns {Object<string, (string|Array.string|boolean)>}
 */
Query.insert = function(table, values) {
    var clause = hashToClause(values, ',');
	var statement = 'INSERT INTO ' + table + ' SET ' + clause.placeholder;
	return { statement: statement, args: clause.values, affect: true };
};

/**
 * Remove elements matching 'where' condition
 *
 * @param {string} table
 * @param {Object<string, string>} where Build a key = element condition
 * @returns {Object<string, (string|Array.string|boolean)>}
 */
Query.remove = function(table, where) {
    var clause = hashToClause(where, ' AND ');
	var statement = 'DELETE FROM ' + table + ' WHERE ' + clause.placeholder;
	return { statement: statement, args: clause.values, affect: true };
};

/**
 * Update a row
 *
 * @param {string} table
 * @param {Object<string, string>} values The values to update in the matched element
 * @param {Object<string, string>} where Build a key = element condition
 * @returns {Object<string, (string|Array.string|boolean)>}
 */
Query.update = function(table, values, where) {
    var valuesClause = hashToClause(values, ' AND ');
    var whereClause = hashToClause(where, ' AND ');
    var statement = 'UPDATE ' + table + ' SET ' + valuesClause.placeholder + ' WHERE ' +
        whereClause.placeholder;
	return { statement: statement, args: valuesClause.values.concat(whereClause.values), affect: true };
};

module.exports = Query;
