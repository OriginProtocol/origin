const transactionTypeMap = {
  buyListing: 'ListingPurchased',
  closeListing: 'ListingChange',
  confirmReceipt: 'PurchaseChange',
  confirmShipped: 'PurchaseChange',
  getPayout: 'PurchaseChange',
}

export default transactionTypeMap
