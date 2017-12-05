# dgraph-node

[![Build Status](https://travis-ci.org/calummoore/dgraph-node.svg?branch=master)](https://travis-ci.org/calummoore/dgraph-node)
[![Coverage Status](https://coveralls.io/repos/github/calummoore/dgraph-node/badge.svg?branch=master)](https://coveralls.io/github/calummoore/dgraph-node?branch=master)

A NodeJS Dgraph client.

Note: this API may be subject to change with only minor release version.

Install with:

```
npm install dgraph-node
```

#### Benefits:
 - Fast (gRPC)
 - Works with Dgraph v0.9
 - Supports transactions

### Example

```javascript
import DgraphClient from 'dgraph-node'
// const DgraphClient = require('dgraph-node').default

// Create a new client (these are the defaults)
let client = new DgraphClient({
  url: 'localhost:9080',
})

// Set mutation
await client.mutate({
  set: '<_:bob> <name> "Bob" .'
})

// Delete mutation
await client.mutate({
  del: '<0x100> * * .',
})

// Query
await client.query(`
  query {
    q(func: uid(0xcceb)) {
      name
    }
  }
`)

// Transactions
const txn = client.txn() // Just setting up instance (no call to Dgraph)

// Same API as above on the txn instance
await txn.mutate({
  set: '<_:bob> <name> "Bob" .'
})

...

// Commit when you're done
// Dgraph will error if the transaction fails (due to another edit)
await txn.commit()

```

## API

### DgraphClient(options)

Creates a new instance of the Dgraph client.

#### `options` object properties

| Property    | Default        | Description |
|-------------|----------------|-------------|
| url         | localhost:9080 | IP and port of Dgraph. |
| debug       | false          | Add additional console logs |
| credentials | grpc.credentials.createInsecure() | Valid grpc.credentials. See [gPRC docs](https://grpc.io/docs/guides/auth.html) |


#### mutate (mutation, commit=true, startTs)

Set or delete nodes from Dgraph. Mutation is an object with `set` and `del` properties. By default, it will commit changes immediately to Dgraph. Set `startTs` if you are managing the transaction youself (not recommended!).


#### query (queryStr, linRead)

Query the Dgraph DB. `linRead` is used for ensuring queries are always consistent (i.e. you have the latest data available). By default, this is managed the client, but the option allows you to override it if you want to manage it yourself (not recommended!).


#### alter (schema)

Update the schema.

```js
  let client = new DgraphClient()

  client.alter(`name: string .`)
```


#### dropAll ()

Drop the entire Dgraph database. Removes all data (be careful!)

```js
  let client = new DgraphClient()

  client.dropAll()
```


#### dropAttr (attrName)

Drop a schema attribute.

```js
  let client = new DgraphClient()

  client.dropAttr('name')
```


#### txn ()

Locally creates a transaction with `query(queryStr)`, `mutate(mutation)` and `commit()` methods. These methods function the same as above.


### Inspired by:
Dgraph Client - https://github.com/reicheltp/dgraph-client
