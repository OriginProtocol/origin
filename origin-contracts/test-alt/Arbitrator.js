import assert from 'assert'
import helper from './_helper'

// Account 0: Token owner. Marketplace owner
// Account 1: Seller
// Account 2: Buyer
// Account 3: Dispute resolver

describe('ArbitrableExample.sol', async function() {
  let accounts, deploy, web3
  let Arbitrator, Arbitrable

  before(async function() {
    ({ deploy, accounts, web3 } = await helper(`${__dirname}/..`))

    Arbitrator = await deploy('CentralizedArbitrator', {
      from: accounts[0],
      path: `${__dirname}/contracts/arbitration/`,
      args: [0]
    })

    Arbitrable = await deploy('ArbitrableExample', {
      from: accounts[0],
      path: `${__dirname}/contracts/arbitration/`,
      args: [Arbitrator._address]
    })
  })

  it('should allow a dispute to be created', async function() {
    const result = await Arbitrable.methods.startDispute().send({
      value: web3.utils.toWei('0.1', 'ether')
    })
    assert(result.events.Dispute)
  })

  it('should allow a ruling to be given', async function() {
    const result = await Arbitrator.methods.giveRuling(0, 1).send()
    const { data, topics } = result.events['0'].raw
    const ruling = Arbitrable._jsonInterface.find(i => {
      return i.signature === topics[0]
    })
    const decoded = web3.eth.abi.decodeLog(ruling.inputs, data, topics)
    assert.equal(ruling.name, 'Ruling')
    assert.equal(decoded._ruling, '1')
  })

  it('should allow evidence to be submitted', async function() {
    const result = await Arbitrable.methods.submitEvidence(0, 'evidence').send()
    assert(result.events.Evidence)
  })
})
