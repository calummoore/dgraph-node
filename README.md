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
import DgraphClient from 'dgraph-node';

// Create a new client
let client = new DgraphClient()

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

### Inspired by:
Dgraph Client - https://github.com/reicheltp/dgraph-client
