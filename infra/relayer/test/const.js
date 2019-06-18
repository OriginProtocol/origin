const BN = require('bn.js')

module.exports = {
  // Mnemonics
  MNEMONIC_ONE: 'one two three for five six',
  MNEMONIC_TWO: 'two two three four five six',
  MNEMONIC_THREE: 'three two three four five six',
  MNEMONIC_FOUR: 'four two three four five six',
  MNEMONIC_FIVE: 'five two three four five six',
  MNEMONIC_SIX: 'six two three four five six',
  MNEMONIC_SEVEN: 'seven two three four five six',
  TEST_NET_ID: 999,
  TEST_PROVIDER_URL: 'http://localhost:8545/',

  // Amounts in BN
  ZERO: new BN('0', 10),
  ONE_ETHER: new BN('1000000000000000000', 10),
  FIVE_ETHER: new BN('5000000000000000000', 10),
  TWO_GWEI: new BN('2000000000', 10),

  JUNK_HASH: '0x16c55d9e9ca5b673cafaa112195a5ad78ceb104e612ff2afbf34c233d6e7482b',
  JUNK_HASH2: '0xe2c8f58f0df9cec2871ea15158e280ec612c88c13436bc131ebac9868db8cafe',

  // IdentityUpdated(address,bytes32)
  EVENT_SIG_IDENTITYUPDATED: '0x8a49a94a170e0377e29de8e4b741993bed3dc902443fdc59d79e455137ecab18',
  // ProxyCreation(address)
  EVENT_SIG_PROXYCREATION: '0xa38789425dbeee0239e16ff2d2567e31720127fbc6430758c1a4efc6aef29f80',
  // OwnerChanged(address)
  EVENT_SIG_OWNERCHANGED: '0xa2ea9883a321a3e97b8266c2b078bfeec6d50c711ed71f874a90d500ae2eaf36'
}
