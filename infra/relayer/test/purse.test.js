const assert = require('assert')
const BN = require('bn.js')
const Web3 = require('web3')
const Purse = require('../src/purse')
const {
  waitForTransactionReceipt,
  getBalance,
  startMining,
  stopMining,
  insensitiveInArray,
  wait
} = require('./utils')

const MNEMONIC_ONE = 'one two three four five six'
const MNEMONIC_TWO = 'two two three four five six'
const MNEMONIC_THREE = 'three two three four five six'
const TEST_NET_ID = 999
const TEST_PROVIDER_URL = 'http://localhost:8545/'
const ZERO = new BN('0', 10)
const ONE_ETHER = new BN('1000000000000000000', 10)
const TWO_GWEI = new BN('2000000000', 10)

const web3 = new Web3(TEST_PROVIDER_URL)

describe('Purse', () => {
  let Funder, Rando

  before(async () => {
    
    assert(await web3.eth.net.getId() === TEST_NET_ID, 'Not the expected test network!')

    const accounts = await web3.eth.getAccounts()
    Funder = accounts[0]
    Rando = accounts[1]
  })

  it('initialize and autofund accounts', async () => {
    const childCount = 3
    const purse = new Purse({ web3, mnemonic: MNEMONIC_ONE, children: childCount, autofundChildren: true })
    await purse.init()

    const masterAddress = purse.masterWallet.getChecksumAddressString()
    let masterBalance = await getBalance(web3, masterAddress)
    assert(masterBalance.eq(ZERO), 'master account already funded? test chain not clear')

    if (masterBalance.eq(ZERO)) {
      // fund the master address
      const tx = await web3.eth.sendTransaction({
        to: masterAddress,
        from: Funder,
        value: ONE_ETHER,
        gas: 21000,
        gasPrice: TWO_GWEI
      })

      const receipt = await waitForTransactionReceipt(web3, tx.transactionHash)

      assert(receipt.status)
    
      masterBalance = await getBalance(web3, masterAddress)
      assert(masterBalance.eq(ONE_ETHER))
    }

    const actualChildCount = purse.children.length
    assert(
      actualChildCount === childCount,
      `wrong amount of children. expected ${childCount} but found ${actualChildCount}`
    )

    // Verify the children are 0 balance
    for(let i = 0; i < purse.children.length; i++) {
      const child = purse.children[i]
      const childBal = await getBalance(web3, child)
      assert(childBal.eq(ZERO))
    }

    // Do initial funding
    await purse.fundChildren() // TODO use autofundChildren?

    // Verify the children are 0 balance
    for(let i = 0; i < purse.children.length; i++) {
      const child = purse.children[i]
      const childBal = await getBalance(web3, child)
      assert(childBal.gt(ZERO), `expected more than naught`)
    }

    await purse.teardown(true)
  })

  it('initialize the same accounts with the same mnemonic', async () => {
    const childCount = 2

    const purseOne = new Purse({ web3, mnemonic: MNEMONIC_ONE, children: childCount })
    await purseOne.init()

    const purseTwo = new Purse({ web3, mnemonic: MNEMONIC_ONE, children: childCount })
    await purseTwo.init()

    const purseThree = new Purse({ web3, mnemonic: MNEMONIC_TWO, children: childCount })
    await purseThree.init()

    assert(
      purseOne.masterWallet.getChecksumAddressString() === purseTwo.masterWallet.getChecksumAddressString(),
      'master mismatch'
    )

    assert(
      purseOne.masterWallet.getChecksumAddressString() !== purseThree.masterWallet.getChecksumAddressString(),
      'masters with different mnemonics should not match'
    )

    for (let i = 0; i < childCount; i++) {
      assert(purseOne.children[i] === purseTwo.children[i], 'account mismatch')
      assert(
        purseOne.children[i] !== purseThree.children[i],
        'accounts from different mnemonics should not match'
      )
    }

    await purseOne.teardown(true)
    await purseTwo.teardown(true)
    await purseThree.teardown(true)
  })

  it('sends transactions from children', async () => {
    const purse = new Purse({ web3, mnemonic: MNEMONIC_ONE, children: 2 })
    await purse.init()

    const txObj = {
      to: Rando,
      value: '1',
      data: '0xdeadbeef',
      gas: 22000,
      gasPrice: TWO_GWEI.toString()
    }

    const txHash = await purse.sendTx(txObj)
    const receipt = await waitForTransactionReceipt(web3, txHash)

    assert(receipt.status, 'tx failed')
    assert(
      receipt.from.toLowerCase() !== purse.masterWallet.getChecksumAddressString().toLowerCase(),
      'sent from master'
    )
    assert(insensitiveInArray(receipt.from, purse.children), 'not a recognized child')

    await purse.teardown(true)
  })

  it('sends transactions without waiting for them to be mined', async () => {
    const purse = new Purse({ web3, mnemonic: MNEMONIC_ONE, children: 2 })
    await purse.init()

    const txObj = {
      to: Rando,
      value: '1',
      gas: 22000,
      gasPrice: TWO_GWEI.toString()
    }

    // Stop mining
    await stopMining(web3)

    const txHash = await purse.sendTx(txObj)

    try {
      await waitForTransactionReceipt(web3, txHash, 2000)
      assert(false, 'should have timed out')
    } catch (err) {
      assert(err.message.indexOf('Timeout') > -1, err.message)
      // start it again for the following tests
      await startMining(web3)
    }

    await purse.teardown(true)
  })

  // This is best tested with Redis, but not required
  it('keeps persistent and accurate count of nonce', async () => {
    const purseOne = new Purse({ web3, mnemonic: MNEMONIC_ONE, children: 2 })
    await purseOne.init()
    const txHash = await purseOne.sendTx( {
      to: Rando,
      value: '1',
      gas: 22000,
      gasPrice: TWO_GWEI.toString()
    })
    const receipt = await waitForTransactionReceipt(web3, txHash)
    assert(receipt.status)

    const sentFrom = web3.utils.toChecksumAddress(receipt.from)

    // Second instance should come up with the right tx count
    const purseTwo = new Purse({ web3, mnemonic: MNEMONIC_ONE, children: 2 })
    await purseTwo.init()

    const firstTXCount = await purseOne.txCount(sentFrom)
    const secondTXCount = await purseTwo.txCount(sentFrom)

    assert(firstTXCount === secondTXCount)
    assert(purseOne.accounts[sentFrom].txCount === purseTwo.accounts[sentFrom].txCount)

    await purseOne.teardown(true)
    await purseTwo.teardown(true)
  })

  // Not yet implemented
  it('should init once master account is funded and autofund children', async () => {
    const childCount = 2
    const purse = new Purse({
      web3,
      mnemonic: MNEMONIC_THREE,
      children: childCount,
      autofundChildren: true
    })
    await purse.init()

    const masterAddress = purse.masterWallet.getChecksumAddressString()
    let masterBalance = await getBalance(web3, masterAddress)
    assert(masterBalance.eq(ZERO), 'non-zero balance on master')

    for (let i = 0; i < childCount; i++) {
      const chidlBal = await getBalance(web3, purse.children[i])
      assert(chidlBal.eq(ZERO), 'non-zero balance on child')
    }

    // Fund the master account
    const receipt = await web3.eth.sendTransaction({
      from: Funder,
      to: masterAddress,
      value: ONE_ETHER,
      gas: 22000,
      gasPrice: TWO_GWEI
    })
    assert(receipt.status, 'funding tx failed')

    masterBalance = await getBalance(web3, masterAddress)
    assert(masterBalance.eq(ONE_ETHER), 'balance on master after funding is wrong')

    // Wait 1s per child. 
    await wait(childCount * 1000)

    // Check that the children were autofunded
    for (let i = 0; i < childCount; i++) {
      const chidlBal = await getBalance(web3, purse.children[i])
      assert(chidlBal.gt(ZERO), 'zero balance on child')
    }
  })

  // TODO, not yet implemented
  it.skip('can drain child accounts', async () => { assert(false, 'Not implemented') })

  // Not yet implemented
  it.skip('should be able to handle a large volume of transactions', async () => { assert(false, 'Not implemented') })

  // TODO: Can dropped transactions be tested with ganache?  skipping for now...
  it.skip('rebroadcasts transactions that are dropped', async () => { assert(false, 'Not implemented') })
})