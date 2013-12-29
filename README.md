node-mysql-ext v0.0.3
==============

Node.js Mysql extension to node-mysql

## How to use it

### Simple queries

You can use the following methods through a client instance:
- count
- select
- selectW
- insert
- remove
- update
- raw
- query (alias to raw)


Moreover, if you add a 'p' prefix (pcount, pselect, pselectW, pinsert, premove, pupdate), then you don't need to provide a connection.
In this case, a connection is requested from a pool of connections during the query.

```javascript
var MysqlExtClient = require('mysql-ext').Client;

var client = new MysqlExtClient({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '',
  database: 'test',
  table: {
  	USERS: 'users',
	ETC: 'etc'
  }
});

var userObject = {
  nickname: 'shaoner',
  email_address: 'shaoner@gmail.com',
  password: 'bisous',
  enabled: true
};

// Single simple query that inserts the userObject into table users
client.pinsert(client.table.USERS, userObject, function(err, res) { });

// In this case, we can use the same connection for several queries
client.pool.getConnection(function(err, connection) {
  if (err)
    throw err;
  client.insert(connection, client.table.USERS, function(err, res) {
    if (err)
      throw err;
    if (res.affectedRows > 0) {
      client.selectW(client.table.USERS, [ 'nickname', 'email_address' ], { id: 5 }, function(err, res) {
        if (err)
          throw err;
        console.log(res);
      });
    }
  });
});

```

### Multiple statements

You can do multiple queries at once or sql transactions using the Query object.
The Query object contains exactly the same functions as the client, but this time it only prepare a query:
- count
- select
- selectW
- insert
- remove
- update
- raw

All these methods actually return an object that contains:
- The statement (containing '?' standing for each variable that will be replaced)
- The statement's arguments in an Array
- A boolean indicating if the query may affect some row(s) (typically with a side-effect statement it should be true)

```javascript
var MysqlExtClient = require('mysql-ext').Client;
var Query = require('mysql-ext').Query;

var client = new MysqlExtClient({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '',
  database: 'test'
});

var user1 = {
  nickname: 'shaoner',
  email_address: 'shaoner@gmail.com',
  password: 'bisous',
  enabled: true
};

var user2 = {
  nickname: 'user2',
  email_address: 'user2@mail.com',
  password: 'mypassword',
  enabled: true
};

// This shortcut actually starts an SQL transaction by executing each query separately
// If an error occurs or one of the statement supposed to affect some rows somehow does not
// Then an error if set in the callback
client.ptransaction([
  Query.insert(client.table.USERS, user1),
  Query.insert(client.table.USERS, user2),
  Query.raw('UPDATE otherTable SET uid = LAST_INSERT_ID() AND nickname = ?', [ user2.nickname ], true)
], function(err) {
  if (err)
    throw err;
  console.log('everything seems fine');
});
```

## API

### Query

#### select

```javascript
/**
 * Select elements
 *
 * @param {string} table
 * @param {Array.string} fields
 * @returns {Object<string, (string|Array.string|boolean)>}
 */
```

#### selectW

```javascript
/**
 * Select elements with a condition
 *
 * @param {string} table
 * @param {Array.string} fields
 * @param {Object<string, string>} where Build a key = element condition
 * @returns {Object<string, (string|Array.string|boolean)>}
 */
```

#### count

```javascript
/**
 * Count elements
 *
 * @param {string} table
 * @param {Object<string, string>} where Build a key = element condition
 * @returns {Object<string, (string|Array.string|boolean)>}
 */
```

#### insert

```javascript
/**
 * Insert object
 *
 * @param {string} table
 * @param {Object<string, ?>} values The object to insert
 * @returns {Object<string, (string|Array.string|boolean)>}
 */
```

#### remove

```javascript
/**
 * Remove elements matching 'where' condition
 *
 * @param {string} table
 * @param {Object<string, string>} where Build a key = element condition
 * @returns {Object<string, (string|Array.string|boolean)>}
 */
```

#### update

```javascript
/**
 * Update a row
 *
 * @param {string} table
 * @param {Object<string, string>} values The values to update in the matched element
 * @param {Object<string, string>} where Build a key = element condition
 * @returns {Object<string, (string|Array.string|boolean)>}
 */
```

#### raw

```javascript
/**
 * Simple raw query
 *
 * @param {string} statement
 * @param {Array.<string>} args
 * @param {Boolean} affect Tell if this query should affect some rows
 * @returns {Object<string, (string|Array.string|boolean)>}
 */
```


### Client

Each of these methods can alternatively be called with a 'p' prefix without providing the connection.

#### Create a new Client

To create a new client, you need to pass it a config object see [node-mysql](https://github.com/felixge/node-mysql) for more details.

#### select

```javascript
/**
 * Select elements
 *
 * @param {mysql.Connection} connection
 * @param {string} table
 * @param {Array.string} fields
 * @param {Function} callback
 */
```

#### selectW

```javascript
/**
 * Select elements with a condition
 *
 * @param {mysql.Connection} connection
 * @param {string} table
 * @param {Array.string} fields
 * @param {Object<string, string>} where Build a key = element condition
 * @param {Function} callback
 */
```

#### count

```javascript
/**
 * Count elements
 *
 * @param {mysql.Connection} connection
 * @param {string} table
 * @param {Object<string, string>} where Build a key = element condition
 * @param {Function} callback
 */
```

#### insert

```javascript
/**
 * Insert object
 *
 * @param {mysql.Connection} connection
 * @param {string} table
 * @param {Object<string, ?>} values The object to insert
 * @param {Function} callback
 */
```

#### remove

```javascript
/**
 * Remove elements matching 'where' condition
 *
 * @param {mysql.Connection} connection
 * @param {string} table
 * @param {Object<string, string>} where Build a key = element condition
 * @param {Function} callback
 */
```

#### update

```javascript
/**
 * Update a row
 *
 * @param {mysql.Connection} connection
 * @param {string} table
 * @param {Object<string, string>} values The values to update in the matched element
 * @param {Object<string, string>} where Build a key = element condition
 * @param {Function} callback
 */
```

#### query or raw

```javascript
/**
 * Simple raw query
 *
 * @param {mysql.Connection} connection
 * @param {string} statement
 * @param {Array.<string>} args
 * @param {Boolean} affect Tell if this query should affect some rows
 * @param {Function} callback
 */
```

#### multi

```javascript
/**
 * Run multiple queries at once
 * To use it, you have to explicitly enable multipleStatements in the config
 * However this is not always recommanded
 *
 * @param {mysql.Connection} connection
 * @param {Array.Query} queries
 * @param {Function} callback
 */
```

#### transaction
```javascript
/**
 * Starts a transaction
 *
 * @param {mysql.Connection} connection
 * @param {Array.Query} queries
 * @param {Function} callback
 */
```

## TODO

- [ ] Unit tests
- [ ] Create table wrapper
- [ ] Create database wrapper (not sure this is pertinent)
- [ ] ...
