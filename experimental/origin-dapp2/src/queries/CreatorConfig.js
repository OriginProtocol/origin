import gql from 'graphql-tag'

export default gql`
  query CreatorConfig {
    creatorConfig {
      title
      about
      logoUrl
      faviconUrl
      marketplacePublisher
      cssVars {
        lightFooter
        background
        dark
        darkTwo
        light
        clearBlue
        paleClearBlue
        darkGreyBlue
        darkClearBlue
        darkGrey
        paleGrey
        paleGreyTwo
        paleGreyThree
        paleGreyFour
        paleGreyFive
        paleGreySix
        paleGreySeven
        paleGreyTwoDarker
        paleGreyEight
        dusk
        lightDusk
        steel
        greenblue
        paleGreenblue
        paleYellow
        mustard
        gold
        goldenRod
        goldenRodLight
        lightGreenblue
        bluishPurple
        blueyGrey
        darkBlueGrey
        orangeRed
        orangeRedLight
        red
        darkRed
        lightRed
        darkPurple
        boostLow
        boostMedium
        boostHigh
        boostPremium
        defaultRadius
      }
    }
  }
`
