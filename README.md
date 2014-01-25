node-query-sql v0.1.0
==============

Node.js Mysql Query Builder to node-mysql

## Installation

`npm install query-sql`

### Notes

This module has been rebuilt to be an SQL abstraction instead of an SQL helper.
It has to be used in addition of [node-mysql](https://github.com/felixge/node-mysql).
Since this does not cover the entire SQL language yet, feel free to contribute.

## How to use it

### Examples

You can use the following methods to build an SQL query in a Javascript way that fits with [node-mysql](https://github.com/felixge/node-mysql).

#### Simple queries

```javascript

var q = Query.select([ 'a', 'b', 'c', 'd' ], 'table1').where({ id: 12 });

```

- q.statement contains `"SELECT a,b,c,d FROM ?? where id = ?"`
- q.values contains `[ 'table1', 12 ]`

You can use `q.toString()` to get the final query string, or you can pass to the mysql query method both attributes (statement and values).

#### Combines queries

```javascript

var mysql      = require('mysql');
var connection = mysql.createConnection(...);
var Query = require('query-sql');

var q = Query.select('id', 'table1').where({ x: 12 });

var q2 = Query.update('table2', { nickname: 'newNick' }).whereIn('id', q);

q2.exec(connection, function(err, res) {
	console.log(err, res);
	Query.delete('table2').where({ nickname: 'newNick'	}).exec(function(err, res) {
		// ...
	});
});

```
This will execute:
- UPDATE \`table2\` SET nickname = 'newNick' WHERE id IN (SELECT id FROM \`table1\` WHERE x = 12)
- DELETE FROM \`table2\` WHERE nickname = 'newNick'

#### Asynchronous multiple statements

This could be done a better way, this is just for the example:

```javascript

var mysql      = require('mysql');
var pool = mysql.createPool(...);
var async = require('async');
var Query = require('query-sql');

db.getConnection(function(err, conn) {
	async.waterfall([
		function(cb) {
			Query
					.select([ 'id', 'email', 'photo' ], 'table_user')
					.where({ email: 'hello@world.com' }).limit(1)
					.exec(conn, function(err, res) {
						cb(err, res);
					});
		},
		function(res, cb) {
			var user = res[0];
			Query
					.insert('table_bookmark', { id_user: user.id })
					.exec(conn, function(err, res) {
						cb(err, res, user);
					});
		},
		function(res, user, cb) {
			if (res.affectedRows != 0)
			   	return cb(new Error('this bookmark already exists'), res);
			Query
					.update('table_user', { has_bookmark: true })
					.where({ id: user.id })
					.exec(function(err, res) {
						cb(err, res);
					});
		}
	], function(err, res) {
		conn.release();
	   	if (err) {
		   // error treatment
		   // ...
		} else
			console.log('OK!');

	});
});

```

## API

### Query builder method

#### Query.select(fields, table)

This builds a 'SELECT' statement and returns the new query.

- `table`: the SQL table
- `fields`: an array of fields

#### Query.insert(table, fields)

This builds an 'INSERT' statement and returns the new query.

- `table`: the SQL table
- `fields`: an object containing table field as keys and new values.

#### Query.update(table, fields)

This builds an 'UPDATE' statement and returns the new query.

- `table`: the SQL table
- `fields`: an object containing table field as keys and updated values.

#### Query.count(table)

This builds a 'SELECT COUNT(*)' statement and returns the new query.

- `table`: the SQL table

#### Query.delete(table)

This builds a 'DELETE' statement and returns the new query.

- `table`: the SQL table

### Query clauses

#### whereIn(field, query)

This appends a 'WHERE field IN' clause to this query

- `field`: the field to find
- `query`: a string or a query to look in

#### where(condition)

This appends a 'WHERE' clause to this query

- `condition`: a string or an object expressing a condition (with AND)

#### innerJoin(table, condition)

This appends a 'INNER JOIN' clause to this query on `table`

- `table`: the SQL table to join
- `condition`: the JOIN condition (string or object)

#### join(table, condition)

This is an alias to innerJoin

#### orderby(field[, desc])

This appends an 'ORDER BY field' clause to this query.

- `field`: the sorting field
- `desc`: a boolean to say if results should be sorted DESC (default ASC)

#### limit([offset, ]lines)

This appends a 'LIMIT' clause to this query

- `offset`: the starting offset
- `lines`: the number of lines to limit

#### append(statement, values)

This append a statement to this query

- `statement`: the statement to append
- `values`: the array of values to append

#### exec(connection[, cb])

This execs this query

- `connection`: a [node-mysql](https://github.com/felixge/node-mysql) connection
- `cb`: the callback called by connection.query

#### toString()

This returns the final formatted query

## TODO

- [ ] Unit tests
- [ ] Append query method
- [ ] ...
