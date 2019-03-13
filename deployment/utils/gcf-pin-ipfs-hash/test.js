const chai = require('chai')
const expect = chai.expect
const fs = require('fs')

const listingLog = JSON.parse(fs.readFileSync('fixtures/listing-log.json'))
const { extractIpfsHashFromUrl, parseIncomingData } = require('./index.js')

describe('parse', () => {
  it('should correctly parse listings', () => {
    const hashesToPin = parseIncomingData(listingLog)
    expect(hashesToPin).to.be.an('array').to.have.members([
      'QmNyo8RCuhqDCgyQkVuihjTB1KJ3EXxkiTHmkzukFiw9Nd',
      'QmU2NeZjiJZ7TyFCwqHp2bd7MH1bSyZbSAgGxNSR2iUQ3M',
      'QmSXucmB6BHgFUW6wZyXknD3HrAtXvAy2t7JHMgXXNU79n',
      'QmZLxmJBPY3ae9PNqKZhWZX6oF764sxXAQw3y3fJu2xgw1',
      'QmQJymkfuCCPFnRDvi6jJALhBTqBRToJ5gGay2sPBEHFtY',
      'QmRPJzi5wDVkrwqGVDqVoYsJr6AonysisjszuMbEbJAD8w'
    ])
  })
})

describe('extract ipfs hash from url', () => {
  it('should handle ipfs:// correctly', () => {
    const result = extractIpfsHashFromUrl(
      'ipfs://QmU2NeZjiJZ7TyFCwqHp2bd7MH1bSyZbSAgGxNSR2iUQ3M'
    )
    expect(result).to.equal('QmU2NeZjiJZ7TyFCwqHp2bd7MH1bSyZbSAgGxNSR2iUQ3M')
  })

  it('should handle http:// correctly', () => {
    const result = extractIpfsHashFromUrl(
      'http://origin-ipfs-proxy:9999/ipfs/QmU2NeZjiJZ7TyFCwqHp2bd7MH1bSyZbSAgGxNSR2iUQ3M'
    )
    expect(result).to.equal('QmU2NeZjiJZ7TyFCwqHp2bd7MH1bSyZbSAgGxNSR2iUQ3M')
  })

  it('should handle https:// correctly', () => {
    const result = extractIpfsHashFromUrl(
      'https://origin-ipfs-proxy:9999/ipfs/QmU2NeZjiJZ7TyFCwqHp2bd7MH1bSyZbSAgGxNSR2iUQ3M'
    )
    expect(result).to.equal('QmU2NeZjiJZ7TyFCwqHp2bd7MH1bSyZbSAgGxNSR2iUQ3M')
  })
})
