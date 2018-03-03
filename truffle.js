module.exports = {
  migrations_directory: "./migrations",
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    rinkeby: {
      host: "localhost",
      port: 8545,
      from: "0x0085f8e72391Ce4BB5ce47541C846d059399fA6c", // default address to use for any transaction Truffle makes during migrations
      network_id: 4,
      gas: 4612388 // Gas limit used for deploys
    },
    ropsten: {
      host: "localhost",
      port: 8545,
      from: "0xbeadc9585b8336646f6a089bc935ccae2b85b781", // default address to use for any transaction Truffle makes during migrations
      network_id: 3,
      gas: 4612388 // Gas limit used for deploys
    }
  },
  solc: { optimizer: { enabled: true, runs: 200 } }
};
