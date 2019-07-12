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
const {
  MNEMONIC_ONE,
  MNEMONIC_TWO,
  MNEMONIC_THREE,
  MNEMONIC_FOUR,
  MNEMONIC_FIVE,
  MNEMONIC_SIX,
  TEST_NET_ID,
  TEST_PROVIDER_URL,
  ZERO,
  FIVE_ETHER,
  TWO_GWEI
} = require('./const')

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
        value: FIVE_ETHER,
        gas: 21000,
        gasPrice: TWO_GWEI
      })

      const receipt = await waitForTransactionReceipt(web3, tx.transactionHash)

      assert(receipt.status)
    
      masterBalance = await getBalance(web3, masterAddress)
      assert(masterBalance.eq(FIVE_ETHER))
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
    await purse.fundChildren()

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

    const { txHash, gasPrice } = await purse.sendTx(txObj)
    const receipt = await waitForTransactionReceipt(web3, txHash)

    assert(receipt.status, 'tx failed')
    assert(
      receipt.from.toLowerCase() !== purse.masterWallet.getChecksumAddressString().toLowerCase(),
      'sent from master'
    )
    assert(insensitiveInArray(receipt.from, purse.children), 'not a recognized child')
    assert(gasPrice.gt(0))

    await purse.teardown(true)
  })

  it('adjusts the child pending count as transactions are mined', async () => {
    const purse = new Purse({ web3, mnemonic: MNEMONIC_ONE, children: 2 })
    await purse.init()

    const txObj = {
      to: Rando,
      value: '1',
      data: '0xdeadbeef',
      gas: 22000,
      gasPrice: TWO_GWEI.toString()
    }

    const { txHash } = await purse.sendTx(txObj)
    const receipt = await waitForTransactionReceipt(web3, txHash)

    assert(receipt.status, 'tx failed')

    // Give it a couple seconds to do its thing
    await wait(2000)

    // Verify it has no pending
    const checksummedAddress = web3.utils.toChecksumAddress(receipt.from)
    assert(purse.accounts[checksummedAddress].pendingCount == 0)

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

    const { txHash } = await purse.sendTx(txObj)

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
    const { txHash } = await purseOne.sendTx({
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

    // Third instance should not have Redis
    const purseThree = new Purse({
      web3,
      mnemonic: MNEMONIC_ONE,
      children: 2,
      redisHost: 'redis://localhost:666/999'
    })
    await purseThree.init()

    const firstTXCount = await purseOne.txCount(sentFrom)
    const secondTXCount = await purseTwo.txCount(sentFrom)
    const thirdTXCount = await purseThree.txCount(sentFrom)

    assert(typeof firstTXCount === 'number', 'txCount() should return a number')
    assert(typeof secondTXCount === 'number', 'txCount() should return a number')
    assert(typeof thirdTXCount === 'number', 'txCount() should return a number')
    assert(firstTXCount === secondTXCount)
    assert(secondTXCount === thirdTXCount)
    assert(purseOne.accounts[sentFrom].txCount === purseTwo.accounts[sentFrom].txCount)
    assert(purseTwo.accounts[sentFrom].txCount === purseThree.accounts[sentFrom].txCount)

    await purseOne.teardown(true)
    await purseTwo.teardown(true)
    await purseThree.teardown(true)
  })

  // This is best tested with Redis, but not required
  it('keeps persistent and accurate track of pending transactions', async () => {
    const purseOne = new Purse({ web3, mnemonic: MNEMONIC_ONE, children: 2 })
    await purseOne.init()

    // We want to keep transactions in a pending state
    await stopMining(web3)

    const { txHash } = await purseOne.sendTx({
      to: Rando,
      value: '1',
      gas: 22000,
      gasPrice: TWO_GWEI.toString()
    })

    // Make sure the txHash is in pending
    const pendingHashesOne = Object.keys(purseOne.pendingTransactions)
    assert(pendingHashesOne[0] === txHash)

    // Make sure the unsigned tx object is also available
    const txMeta = await purseOne.getPendingTransactionMeta(txHash)
    const txObj = txMeta.txObj
    assert(txObj !== null)
    assert(txObj.to === web3.utils.toChecksumAddress(Rando), `Expected ${web3.utils.toChecksumAddress(Rando)} but got ${txObj.to}`)

    // Second instance should come up with the right tx count
    const purseTwo = new Purse({ web3, mnemonic: MNEMONIC_ONE, children: 2 })
    await purseTwo.init()

    // Make sure the txHash is in pending in the new instance
    const pendingHashesTwo = Object.keys(purseTwo.pendingTransactions)
    assert(pendingHashesTwo.length === 1, 'Should have loaded one pending tx')
    assert(pendingHashesTwo[0] === txHash, 'Did not load the expected pending tx')

    // Restart miner
    await startMining(web3)

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
      value: FIVE_ETHER,
      gas: 22000,
      gasPrice: TWO_GWEI
    })
    assert(receipt.status, 'funding tx failed')

    masterBalance = await getBalance(web3, masterAddress)
    assert(masterBalance.eq(FIVE_ETHER), 'balance on master after funding is wrong')

    // Wait 1s per child. 
    await wait(childCount * 1000)

    // Check that the children were autofunded
    for (let i = 0; i < childCount; i++) {
      const chidlBal = await getBalance(web3, purse.children[i])
      assert(chidlBal.gt(ZERO), 'zero balance on child')
    }

    await purse.teardown(true)
  })

  it('rebroadcasts transactions that are dropped', async () => {
    const childCount = 2
    const purse = new Purse({
      web3,
      mnemonic: MNEMONIC_ONE,
      children: childCount,
      autofundChildren: true
    })
    await purse.init()

    /**
     * This is kinda janky.  We have to meddle with the Purse's internals to get it to behave a
     * certain way.  Not the best of unit tests, but it should be able to test its functionality.
     * Basically, we're giving it a TX that it never really knew about (wasn't sent using sendTX())
     * to see if it attempts a rebroadcast.  This isn't the valid way to use Purse, because it
     * bypasses its internal account management and standard tx tracking abilities.
     */
    const signed = await purse.signTx(purse.children[0], {
      to: Funder,
      value: 1,
      data: '0xdeadbeef',
      gas: 22000,
      gasPrice: TWO_GWEI
    })
    const txHash = web3.utils.sha3(signed.rawTransaction)
    purse.pendingTransactions[txHash] = signed.rawTransaction

    // Give it a few secs to pick it up
    await wait(3000)

    // Check that the counter went up
    assert(purse.rebroadcastCounters[txHash] === 1)

    await purse.teardown(true)
  })

  // Skipping this.  With the custom provider it's slow as... something slow,
  // and the gained value is relatively low.  Will leave here in case needed.
  it.skip('should be able to handle a large volume of transactions', async function () {
    const testTimeout = 300000
    this.timeout(testTimeout)

    const transactionCount = 500
    const childCount = 25
    const purse = new Purse({
      web3,
      mnemonic: MNEMONIC_FOUR,
      children: childCount,
      autofundChildren: true,
      jsonrpcQPS: 500, //Math.ceil((1 / ((testTimeout / 1000) / transactionCount))) + 1
    })
    await purse.init()

    // fund the master address
    const masterAddress = purse.masterWallet.getChecksumAddressString()
    const receipt = await web3.eth.sendTransaction({
      to: masterAddress,
      from: Funder,
      value: FIVE_ETHER.mul(new BN(3, 10)),
      gas: 21000,
      gasPrice: TWO_GWEI
    })
    assert(receipt.status)

    const txTemplate = {
      to: Rando,
      gas: 25000,
      gasPrice: TWO_GWEI
    }

    // MACHINE GUNNNNN
    for (let i = 0; i < transactionCount; i++) {
      const data = `0xdeadbeef`
      await purse.sendTx({
        ...txTemplate,
        data
      })
    }

    assert(Object.keys(purse.pendingTransactions).length > 0, 'no pending transactions')
    await wait(10000) // give it a bit to process the transactions
    assert(Object.keys(purse.pendingTransactions).length === 0, 'there are still pending transactions')

    await purse.teardown(true)
  })

  it('onReceipt callbacks are utilized', () => {
    // https://github.com/mochajs/mocha/issues/2407
    return new Promise(async (resolve) => {
      const childCount = 2
      const purse = new Purse({
        web3,
        mnemonic: MNEMONIC_FIVE,
        children: childCount,
        autofundChildren: true
      })
      await purse.init()

      // Fund the master account
      const masterAddress = purse.masterWallet.getChecksumAddressString()
      const receipt = await web3.eth.sendTransaction({
        from: Funder,
        to: masterAddress,
        value: FIVE_ETHER,
        gas: 22000,
        gasPrice: TWO_GWEI
      })
      assert(receipt.status, 'funding tx failed')

      await purse.sendTx({
        to: Rando,
        value: 1,
        gas: 22000,
        gasPrice: TWO_GWEI,
        data: `0x01`
      }, Funder, async () => {
        await purse.teardown(true)
        resolve()
      })
    })
  })

  it('can drain child accounts', async function () {
    this.timeout(20000)
    const childCount = 5
    const purse = new Purse({
      web3,
      mnemonic: MNEMONIC_SIX,
      children: childCount,
      autofundChildren: true
    })
    await purse.init()

    // Fund the master account
    const masterAddress = purse.masterWallet.getChecksumAddressString()
    const receipt = await web3.eth.sendTransaction({
      from: Funder,
      to: masterAddress,
      value: FIVE_ETHER,
      gas: 22000,
      gasPrice: TWO_GWEI
    })
    assert(receipt.status, 'funding tx failed')

    // Give it a few seconds to fund the children...
    await wait(5000)

    // verify they have balances
    for (let i = 0; i < childCount; i++) {
      const chidlBal = await getBalance(web3, purse.children[i])
      assert(chidlBal.gt(ZERO), 'zero balance on child')
    }

    // Draing
    await purse.drainChildren()

    // Give it a bit to process
    await wait(5000)

    // Verify they'r eempty
    for (let i = 0; i < childCount; i++) {
      const chidlBal = await getBalance(web3, purse.children[i])
      assert(chidlBal.eq(ZERO), 'non-zero balance on child')
    }

    await purse.teardown(true)
  })

  it('stores sender and knows they have a pending', async function () {
    this.timeout(20000)
    const childCount = 2
    const purse = new Purse({
      web3,
      mnemonic: MNEMONIC_ONE,
      children: childCount,
      autofundChildren: true
    })
    await purse.init()

    // Fund the master account
    const masterAddress = purse.masterWallet.getChecksumAddressString()
    const receipt = await web3.eth.sendTransaction({
      from: Funder,
      to: masterAddress,
      value: FIVE_ETHER,
      gas: 22000,
      gasPrice: TWO_GWEI
    })
    assert(receipt.status, 'funding tx failed')

    // Give it a few seconds to fund the children...
    await wait(5000)

    // we want to keep the tx in pending while we test
    await stopMining(web3)

    // Send a transaction
    const { txHash } = await purse.sendTx({
      to: Rando,
      value: 1,
      gas: 22000,
      gasPrice: TWO_GWEI,
      data: `0x01`
    }, Funder)

    assert(purse.hasPending(Funder))

    // Start the miner again
    await startMining(web3)

    // Give it a bit to process
    await wait(3000)

    // should have mined
    assert(await purse.getPendingTransactionMeta(txHash) === null)
    assert(purse.hasPending(Funder) === false)

    await purse.teardown(true)
  })
})
