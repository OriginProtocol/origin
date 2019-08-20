module.exports = `
  extend type Query {
    JSONRPC: JSONRPC
  }

  type JSONRPC {
    eth_blockNumber: Int
    net_version: Int
  }
`
