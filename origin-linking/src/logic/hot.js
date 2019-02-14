import origin, {web3} from './../services/origin'
import fetch from 'cross-fetch'
import { TypedDataUtils, concatSig } from 'eth-sig-util'
import ethUtil from 'ethereumjs-util'
const HOT_WALLET_PK = process.env.HOT_WALLET_PK

const ALLOWED_CALLS = {
  acceptOfferOnBehalf: {feeIndex:3, minFee:'200000000000000'},
  verifiedOnBehalfFinalize: {feeIndex:3, minFee:'200000000000000'}
}


class Hot {
  constructor({}={}) {
    // grab the version that allows for behalf submits
    this.marketplace_adapter = origin.marketplace.resolver.adapters['A']
    this.account = web3.eth.accounts.wallet.add(HOT_WALLET_PK)
    origin.contractService.transactionSigner = this.account.signTransaction
  }

  isAllowedCall(cmd, params){
    const call_const = ALLOWED_CALLS[cmd]
    if (call_const)
    {
      const {feeIndex, minFee} = call_const
      if (web3.utils.toBN(params[feeIndex]).gte(web3.utils.toBN(minFee)))
      {
        return true
      }
    }
  }

  async submitMarketplace(cmd, params) {
    if (!this.isAllowedCall(cmd, params))
    {
      throw new Error(`Error cmd:${cmd} params: ${params} is not an allowed call`)
    }
    const from = this.account.address
    console.log("Submitting...", cmd, params)
    console.log("Pre market balance...", await web3.eth.getBalance(from))
    const ret = await this.marketplace_adapter.call( cmd, params, {from:from})
    console.log("Post market balance...", await web3.eth.getBalance(from))
    return ret
  }

  async verifyOffer(offerId, params) {
    //fetch("https://api.github.com/repos/OriginProtocol/origin/issues/1407").then(r => r.json()).then(j => console.log(j.state)
    const offer = await origin.marketplace.getOffer(offerId)
    console.log("offerId:", offerId)
    const { adapter, listingIndex, offerIndex } = origin.marketplace.resolver.parseOfferId(offerId)
    const offerID = offerIndex
    const listingID = listingIndex
    const verifyTerms = offer.verifyTerms
    const acceptTerms = await origin.ipfsService.loadObjFromFile(origin.contractService.getIpfsHashFromBytes32(offer.acceptIpfsHash))

    const verifyFee = verifyTerms.verifyFee
    const verifyURL = verifyTerms.verifyURL
    const checkArg = verifyTerms.checkArg
    const matchValue = verifyTerms.matchValue

    console.log("verifyTerms:", verifyTerms, " acceptTerms:", acceptTerms, " offerID", offerID, " listingID", listingID)

    if (offer.verifier != this.account.address)
    {
      console.log("Verifier mismatch:", offer.verifier, " this.account:", this.account.address)
    }

    if (verifyURL && checkArg && matchValue) {
      const response = await fetch(verifyURL).then(r => r.json())

      if (response[checkArg] == matchValue){
        const ipfsHash = await origin.ipfsService.saveObjAsFile({verifyURL, checkArg, matchValue, verifyRequester:params})
        const ipfsBytes = origin.contractService.getBytes32FromIpfsHash(ipfsHash)

        //grab the offer directly from the chain
        const rawOffer = await adapter.call('offers', [listingID, offerIndex])

        const payout = web3.utils.toBN(rawOffer.value).sub(web3.utils.toBN(rawOffer.refund)).toString()
        const verifyFee = '100'
        const data = await origin.contractService.getSignFinalizeData(listingID, offerID, ipfsBytes, payout, verifyFee)
        const sig = ethUtil.ecsign(TypedDataUtils.sign(data), ethUtil.toBuffer(HOT_WALLET_PK))
        const signature = ethUtil.bufferToHex(concatSig(sig.v, sig.r, sig.s))
        console.log("Signing:", data, " signature", signature, " payout:", payout, " verifyFee:", verifyFee)
        console.log("raw Offer:", rawOffer)
        return {signature, ipfsBytes, payout, verifyFee}
      }
    }

  }
}
export default Hot
