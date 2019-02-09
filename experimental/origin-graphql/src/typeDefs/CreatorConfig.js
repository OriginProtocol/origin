module.exports = `
  extend type Query {
    creatorConfig(configUrl: String!): CreatorConfig
  }

  type CreatorConfig {
    title: String
    about: String
    logoUrl: String
    faviconUrl: String
    cssVars: CssVars
    marketplacePublisher: String
    listingFilters: [String]
  }

  type CssVars {
    lightFooter: String
    background: String
    dark: String
    darkTwo: String
    light: String
    clearBlue: String
    paleClearBlue: String
    darkGreyBlue: String
    darkClearBlue: String
    darkGrey: String
    paleGrey: String
    paleGreyTwo: String
    paleGreyThree: String
    paleGreyFour: String
    paleGreyFive: String
    paleGreySix: String
    paleGreySeven: String
    paleGreyTwoDarker: String
    paleGreyEight: String
    dusk: String
    lightDusk: String
    steel: String
    greenblue: String
    paleGreenblue: String
    paleYellow: String
    mustard: String
    gold: String
    goldenRod: String
    goldenRodLight: String
    lightGreenblue: String
    bluishPurple: String
    blueyGrey: String
    darkBlueGrey: String
    orangeRed: String
    orangeRedLight: String
    red: String
    darkRed: String
    lightRed: String
    darkPurple: String
    boostLow: String
    boostMedium: String
    boostHigh: String
    boostPremium: String
    defaultRadius: String
  }
`
