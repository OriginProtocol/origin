const TAG_MULTIPLIERS = {
  'Super Featured': 5.0,
  Featured: 2.5,
  'High Quality': 1.75,
  'Low Quality': 0.5,
  Hide: 0.0
}

async function scoreListing(listing) {
  let score = 1.0

  // Downrank anything not active (so lower pending / sold / withdrawn)
  if (listing.status !== 'active') {
    score *= 0.3
  }

  // Downrank "cheap" listings to hide wash/spam transactions.
  // We might want to make this a smoother transition later.
  // ETH value may need to become a dynamic parameter later.
  const cheapListingThresholds = {
    'fiat-USD': 1.5,
    'fiat-EUR': 1.35,
    'token-DAI': 1.5,
    'token-ETH': 0.01
  }
  if (
    listing.price &&
    listing.price.amount &&
    listing.price.currency &&
    listing.price.currency.id
  ) {
    const cheapThreshold = cheapListingThresholds[listing.price.currency.id]
    if (cheapThreshold) {
      if (parseFloat(listing.price.amount) <= cheapThreshold) {
        score *= 0.2
      }
    }
  }

  // Downrank listings with no photos
  if (listing.media === undefined || listing.media.length === 0) {
    score *= 0.8
  }

  // Boost from OGN
  // 50 tokens gets you a 2.25 multiplier to your base score,
  // That's probably overpowered. We might as well encourage
  // listings to use them, and we can sort out a more exact value later.
  if (listing.depositAvailable > 0 && listing.commissionPerUnit > 0) {
    let boostOGN =
      Math.min(listing.commissionPerUnit, listing.depositAvailable) /
      1000000000000000000
    if (boostOGN > 100) {
      boostOGN = 100
    }
    score *= 1.0 + boostOGN * 0.025
  }

  // Handle moderation scoring tags
  if (listing.scoreTags && listing.scoreTags.length > 0) {
    for (const tag of listing.scoreTags) {
      const tagMultiplier = TAG_MULTIPLIERS[tag]
      if (tagMultiplier !== undefined) {
        score *= TAG_MULTIPLIERS[tag]
      }
    }
  }

  return { scoreMultiplier: score }
}

module.exports = {
  scoreListing
}
