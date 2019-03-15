import OriginTokenContract from 'origin-contracts/build/contracts/OriginToken.json'

// Token is a light wrapper around the OriginToken contract.
class Token {
  /**
   * @constructor
   * @param {ContractService} contractService - Contract service
   * @param {Marketplace} marketplace - Marketplace (to get token address)
   */
  constructor({ contractService, marketplace }) {
    this.contractService = contractService
    // In getContract(), we will retrieve the address of the Origin token
    // contract from the marketplace contract.
    this.getTokenAddress = async function() {
      return await marketplace.getTokenAddress()
    }
  }

  /**
   * Returns Origin token contract, loading it from the address stored in the
   * Marketplace contract. This *may* return an OriginToken contract whose
   * implementation is newer than the Marketplace contract. This ensures that
   * Origin.js has forward compatibility with token contracts, as long as we
   * don't change or remove existing token features.
   * @returns OriginToken contract
   */
  async getContract() {
    if (!this.contract) {
      this.contractAddress = await this.getTokenAddress()
      const web3 = this.contractService.web3
      this.contract = new web3.eth.Contract(
        OriginTokenContract.abi,
        this.contractAddress
      )
      this.decimals = await this.contract.methods.decimals().call()
    }
  }

  /**
   * Returns a balance for an address.
   */
  async balanceOf(address) {
    await this.getContract()
    return await this.contract.methods.balanceOf(address).call()
  }

  /**
   * Returns true if transfers and approvals of tokens are paused at the
   * contract level, false if not.
   */
  async isPaused() {
    await this.getContract()
    return await this.contract.methods.paused().call()
  }
}

export default Token
