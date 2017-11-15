import protos from '../protos'

describe('protos', () => {
  it('match snapshot', () => {
    expect(protos).toMatchSnapshot()
  })
})
