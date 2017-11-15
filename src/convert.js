import protos from './protos'

export function createTxnContext ({ startTs, keys, linRead }) {
  const txnContext = new protos.TxnContext()
  txnContext.keys = keys
  txnContext.start_ts = startTs
  txnContext.lin_read = createLinRead(linRead)
  return txnContext
}

export function createLinRead (linRead) {
  const lr = new protos.LinRead()
  lr.ids = linRead
  return lr
}
