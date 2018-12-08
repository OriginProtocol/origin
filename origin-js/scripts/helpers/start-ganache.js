const Ganache = require('ganache-core')

const PORT = 8545

const startGanache = () => {
  return new Promise((resolve, reject) => {
    const server = Ganache.server({
      total_accounts: 10,
      default_balance_ether: 100,
      network_id: 999,
      seed: 123,
      blockTime: 0,
      mnemonic:
        'candy maple cake sugar pudding cream honey rich smooth crumble sweet treat'
    })
    server.listen(PORT, err => {
      if (err) {
        return reject(err)
      }
      console.log(`Ganache listening on port ${PORT}`)
      resolve()
    })
  })
}

module.exports = startGanache
