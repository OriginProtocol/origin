const transactionTypeMap = {
  buyListing: 'ListingPurchased',
  reserveListing: 'ListingPurchased',
  closeListing: 'ListingChange',
  confirmReceipt: 'PurchaseChange',
  confirmShipped: 'PurchaseChange',
  createListing: 'NewListing',
  getPayout: 'PurchaseChange',
}

export default transactionTypeMap
