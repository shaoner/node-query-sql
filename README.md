node-mysql-ext
==============

Node.js Mysql extension to node-mysql

## How to use it

### Simple queries

You have access to the following method through a client:
- count
- select
- selectW
- insert
- remove
- update
- raw
- query (alias to raw)


If you add a 'p' prefix (pcount, pselect, pselectW, pinsert, premove, pupdate), a connection from the pool is requested and used.
Else, you have to provide the connection yourself.

```javascript
var MysqlExtClient = require('mysql-ext').Client;

var client = new MysqlExtClient({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '',
  database: 'test'
});

var userObject = {
  nickname: 'shaoner',
  email_address: 'shaoner@gmail.com',
  password: 'bisous',
  enabled: true
};

client.pinsert('users', userObject, function(err, res) { });

client.pool.getConnection(function(err, connection) {
  if (err)
    throw err;
  client.insert(connection, 'users', function(err, res) {
    if (err)
      throw err;
    if (res.affectedRows > 0) {
      client.selectW('users', [ 'nickname', 'email_address' ], { id: 5 }, function(err, res) {
        if (err)
          throw err;
        console.log(res);
      });
    }
  });
});

```

### Multiple statements

You can build simple multiple statements queries or transactions using the Query object.
The Query object contains exactly the same functions as the client to build a query:
- count
- select
- selectW
- insert
- remove
- update
- raw

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


client.ptransaction([
  Query.insert('users', user1),
  Query.insert('users', user2),
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
