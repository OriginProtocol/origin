const transactionTypeMap = {
  buyListing: 'ListingPurchased',
  closeListing: 'ListingChange',
  confirmReceipt: 'PurchaseChange',
  confirmShipped: 'PurchaseChange',
  createListing: 'NewListing',
  getPayout: 'PurchaseChange'
}

export default transactionTypeMap
