module.exports = Object.freeze({
  'IPFS_API_URL': process.env.IPFS_API_URL || 'localhost:5001',
  'IPFS_GATEWAY_URL': process.env.IPFS_GATEWAY_URL || 'localhost:9090',
  'IPFS_PROXY_PORT': process.env.IPFS_PROXY_PORT || 9999
})
