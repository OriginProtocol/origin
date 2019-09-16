export default {
  // Marketplace
  // -----------
  createListing: 189553,
  updateListing: 38048,
  // makeOffer: 301785,
  makeOffer: 350000, // Temp fix... swapAndMakeOffer transactions are running out of gas
  acceptOffer: 48099,
  finalizeOffer: 150000,
  withdrawOffer: 150000,
  withdrawListing: 60000,
  addFunds: 200000, // Needs real value. Needs GraphQL tests.
  updateRefund: 200000, // Needs real value. Needs GraphQL tests.
  disputeOffer: 60000, // Contract test at 32164.
  executeRuling: 200000, // If ERC20 token used, actual cost will vary
  addData: 28690, // Contract test. Uses offer addData, since amount is larger.

  withdrawDust: 120000, // 21000 is enough for ETH, but ERC20 transfer might need more

  // Identity
  // -----------
  emitIdentityUpdated: 30000 // Manual test at 25116. Needs GraphQL tests.
}
