import createWallet from './web3/createWallet'
import importWallet from './web3/importWallet'
import importWallets from './web3/importWallets'
import removeWallet from './web3/removeWallet'
import sendFromWallet from './web3/sendFromWallet'
import sendFromNode from './web3/sendFromNode'
import setActiveWallet from './web3/setActiveWallet'
import setNetwork from './web3/setNetwork'
import toggleMetaMask from './web3/toggleMetaMask'

import acceptOffer from './marketplace/acceptOffer'
import addAffiliate from './marketplace/addAffiliate'
import addData from './marketplace/addData'
import addFunds from './marketplace/addFunds'
import createListing from './marketplace/createListing'
import deployMarketplace from './marketplace/deployMarketplace'
import disputeOffer from './marketplace/disputeOffer'
import executeRuling from './marketplace/executeRuling'
import finalizeOffer from './marketplace/finalizeOffer'
import makeOffer from './marketplace/makeOffer'
import updateListing from './marketplace/updateListing'
import updateRefund from './marketplace/updateRefund'
import withdrawListing from './marketplace/withdrawListing'
import withdrawOffer from './marketplace/withdrawOffer'

import enableMessaging from './messaging/enableMessaging'
import sendMessage from './messaging/sendMessage'

import deployToken from './token/deployToken'
import transferToken from './token/transferToken'
import updateTokenAllowance from './token/updateTokenAllowance'

import deployUserRegistry from './identity/deployUserRegistry'
import deployIdentityContract from './identity/deployIdentityContract'
import deployIdentity from './identity/deployIdentity'
import updateIdentity from './identity/updateIdentity'

import generateEmailCode from './attestations/generateEmailCode'
import verifyEmailCode from './attestations/verifyEmailCode'
import generatePhoneCode from './attestations/generatePhoneCode'
import verifyPhoneCode from './attestations/verifyPhoneCode'
import verifyFacebook from './attestations/verifyFacebook'
import verifyTwitter from './attestations/verifyTwitter'
import generateAirbnbCode from './attestations/generateAirbnbCode'
import verifyAirbnbCode from './attestations/verifyAirbnbCode'

import updateConfig from './config/updateConfig'

export default {
  addAffiliate,
  acceptOffer,
  addFunds,
  updateRefund,
  createListing,
  createWallet,
  importWallet,
  importWallets,
  deployMarketplace,
  deployToken,
  executeRuling,
  finalizeOffer,
  disputeOffer,
  makeOffer,
  removeWallet,
  sendFromNode,
  sendFromWallet,
  setActiveWallet,
  transferToken,
  updateTokenAllowance,
  withdrawOffer,
  withdrawListing,
  addData,
  updateListing,
  setNetwork,
  toggleMetaMask,
  enableMessaging,
  sendMessage,
  deployUserRegistry,
  deployIdentityContract,
  deployIdentity,
  updateIdentity,
  generatePhoneCode,
  verifyPhoneCode,
  generateEmailCode,
  verifyEmailCode,
  verifyFacebook,
  verifyTwitter,
  generateAirbnbCode,
  verifyAirbnbCode,
  updateConfig,
  refetch: () => true
}
