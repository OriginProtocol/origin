/**
 * @function getOfferState
 * @description Computes the state of an offer
 * @param {Object} chainData - The offer's on-chain data
 * @param {Object} ipfsData - The offer's IPFS data
 * @param {Object[]} events - All events that relate to this offer
 * @param {number} [blockNumber="latest block"] - The block number at which the state should be calculated
 * @return {Object[]} The full offer data set including computed fields
 */
const getOfferState = (chainData, ipfsData, events, blockNumber) => {

}

/**
 * @function getListingState
 * @description Computes the state of a listing
 * @param {Object} chainData - The listing's on-chain data
 * @param {Object} ipfsData - The listing's IPFS data
 * @param {Object[]} offers - All offers that have been made on this listing
 * @param {Object[]} events - All events that relate to this listing
 * @param {number} [blockNumber="latest block"] - The block number at which the state should be calculated
 * @return {Object} The full listing data set including computed fields
 */
const getListingState = (chainData, ipfsData, offers, events, blockNumber) => {

}

export default {
  getOfferState,
  getListingState
}
