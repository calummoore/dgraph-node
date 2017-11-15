import { createLinRead, createTxnContext } from '../src/convert'
import protos from '../src/protos'

describe('convert', () => {
  it('should create a TxnContext object', () => {
    const txnContext = createTxnContext({
      keys: [1, 2, 3],
      startTs: 10,
      linRead: { 1: 10 },
    })
    expect(txnContext).toBeInstanceOf(protos.TxnContext)
    expect(txnContext.start_ts).toEqual(10)
    expect(txnContext.keys).toEqual([1, 2, 3])
    expect(txnContext.lin_read.ids).toEqual({ 1: 10 })
    expect(txnContext).toMatchSnapshot()
  })

  it('should create a LinRead object', () => {
    const linRead = createLinRead({
      1: 10,
    })
    expect(linRead).toBeInstanceOf(protos.LinRead)
    expect(linRead.ids).toEqual({ 1: 10 })
    expect(linRead).toMatchSnapshot()
  })
})
