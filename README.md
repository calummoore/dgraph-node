# dgraph-node

A NodeJS Dgraph client (until Dgraph release an official version).

Note: this API may be subject to change with only minor release version.

#### Benefits:
 - Fast (gRPC)
 - Works with Dgraph v0.9
 - Supports transactions

### Example

```javascript
import DgraphClient from 'dgraph-node';

// Create a new client
let client = new DgraphClient()

// Mutation
await client.mutate({
  set: '<_:bob> <name> "Bob" .'
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
