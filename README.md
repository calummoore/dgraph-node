# dgraph-node

[![Build Status](https://travis-ci.org/calummoore/dgraph-node.svg?branch=master)](https://travis-ci.org/calummoore/dgraph-node)
[![Coverage Status](https://coveralls.io/repos/github/calummoore/dgraph-node/badge.svg?branch=master)](https://coveralls.io/github/calummoore/dgraph-node?branch=master)

A NodeJS Dgraph client (created before the official Dgraph client was released). This library now uses the [official Dgraph client](https://github.com/dgraph-io/dgraph-js), but remains mostly backwards compatible with the previous release (see migration notes below).


Install with:

```
npm install dgraph-node grpc
```

#### Benefits:
 - A more simple interface
 - Works with Dgraph v1.0.x
 - Supports transactions

### Example

```javascript
import DgraphClient from 'dgraph-node'
// const DgraphClient = require('dgraph-node').default

// Create a new client (these are the defaults - no need to pass these!)
let client = new DgraphClient({
  url: ['localhost:9080'], // can provide multiple urls if you have a cluster
  debug: false,
  credentials: grpc.credentials.createInsecure()
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
await txn.commit() // or txn.discard()

```

## API

### DgraphClient(options)

Creates a new instance of the Dgraph client.

#### `options` object properties

| Property    | Default        | Description |
|-------------|----------------|-------------|
| url         | [localhost:9080] | List of IP and port of Dgraph - can be an array of URL for a cluster setup. |
| debug       | false          | Add additional console logs |
| credentials | grpc.credentials.createInsecure() | Valid grpc.credentials. See [gPRC docs](https://grpc.io/docs/guides/auth.html) |


#### mutate (mutation, options)

Set or delete nodes from Dgraph. Mutation is an object with `set` and `del` properties. By default, it will commit changes immediately to Dgraph.

`mutation`
- set - a NQuad string to set
- del - a NQuad string to delete

`options` (set to true when not using a txn):
- commitNow - commit immediately
- ignoreConflict - ignore any conflicts

#### query (queryStr, vars)

Query the Dgraph DB.


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


#### txn ()

Locally creates a transaction with `query(queryStr, vars)`, `mutate(mutation, options)`, `commit()` and `abort()` methods. These methods function the same as above.


### Migrating from < 0.1.9

- dropAttr - have been removed as you can now use the alter()
- startTs/linRead - you can no longer set these yourself, but you probably weren't doing that anyway


### Running Tests

Start a Dgraph instance:
```
docker run -it -p 5080:5080 -p 6080:6080 -p 8080:8080 -p 9080:9080 -p 8000:8000 -p 8081:8081 dgraph/dgraph:v1.0.3 bash -c "dgraph -h & dgraph zero & dgraph server --memory_mb 2048 --zero localhost:5080 & dgraph-ratel"
```

Run (at project root):w
`yarn test`


### Inspired by:
Dgraph Client - https://github.com/reicheltp/dgraph-client
