/**
 * Verify that a hex IPFS hash looks like a valid IPFS hash
 * @param {string} the IFPS hash to check
 * @returns {boolean} if it appears to be valid
 */
export function isHexIPFSHash(ipfsHash) {
  if (ipfsHash.startsWith('0x')) {
    ipfsHash = ipfsHash.slice(2)
  }
  if (!ipfsHash.startsWith('1220')) {
    return false
  }
  return ipfsHash.length === 68
}
