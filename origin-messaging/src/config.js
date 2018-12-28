require('dotenv').config()

module.exports = Object.freeze({
  GLOBAL_KEYS: `${process.env.MESSAGING_NAMESPACE}:global`,
  CONV_INIT_PREFIX: `${process.env.MESSAGING_NAMESPACE}:convo-init-`,
  CONV: `${process.env.MESSAGING_NAMESPACE}:conv`,

  IPFS_ADDRESS: process.env.IPFS_ADDRESS || null,
  IPFS_PORT: process.env.IPFS_PORT || '5001',

  IPFS_MAX_CONNECTIONS: process.env.IPFS_MAX_CONNECTIONS ?
    Number(process.env.IPFS_MAX_CONNECTIONS) : 16384,
  IPFS_REPO_PATH: process.env.IPFS_REPO_PATH || './ipfs',
  IPFS_WS_ADDRESS: process.env.IPFS_WS_ADDRESS || '/ip4/0.0.0.0/tcp/9012/ws',

  ORBIT_DB_PATH: process.env.ORBIT_DB_PATH || './odb',

  RPC_SERVER: process.env.RPC_SERVER,
  NOTIFY_API_ENDPOINT: process.env.NOTIFY_API_ENDPOINT,
  NOTIFY_API_SECURE_TOKEN: process.env.NOTIFY_API_SECURE_TOKEN
})
