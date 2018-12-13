import { ConfigConstants } from 'actions/Config'

const initialState = {
  name: 'Origin Protocol DApp',
  logoUrl: 'images/origin-icon-white.svg',
  iconUrl: 'images/origin-icon-white.svg',
  about: null,
  cssVars: {
    // Fonts
    defaultFont: ['Lato', 'Helvetica Neue', 'Arial', 'Sans-Serif'],
    headingFont: ['Poppins', 'Helvetica Neue', 'Arial', 'Sans-Serif'],
    // Colors
    lightFooter: '#f4f6f7',
    background: '#ffffff',
    dark: '#111d28',
    darkTwo: '#213040',
    light: '#c2cbd3',
    clearBlue: '#1a82ff',
    paleClearBlue: '#f5fafc',
    darkGreyBlue: '#2e3f53',
    darkClearBlue: '#0169e6',
    darkGrey: '#282727',
    paleGrey: '#ebf0f3',
    paleGreyTwo: '#dfe6ea',
    paleGreyThree: '#f6f7f8',
    paleGreyFour: '#fafbfc',
    paleGreyFive: '#f7f8f9',
    paleGreySix: '#fafafa',
    paleGreySeven: '#eaeef1',
    paleGreyTwoDarker: '#cfd8dd',
    paleGreyEight: '#f1f6f9',
    dusk: '#455d75',
    lightDusk: '#889fb7',
    steel: '#6f8294',
    greenBlue: '#26d198',
    paleGreenBlue: '#f5fcfa',
    paleYellow: '#fcf0c3',
    mustard: '#fae088',
    gold: '#f7d14c',
    goldenRod: '#f4c110',
    goldenRodLight: 'rgba(244, 193, 16, 0.1)',
    lightGreenBlue: '#59ffcb',
    bluishPurple: '#6e3bea',
    blueyGrey: '#98a7b4',
    darkBlueGrey: '#0c2033',
    orangeRed: '#ff1a1a',
    orangeRedLight: 'rgba(255, 26, 26, 0.03)',
    red: '#f34755',
    darkRed: '#a2686c',
    lightRed: '#fbdbdb',
    darkPurple: '#a27cff',
    boostLow: 'var(--pale-yellow)',
    boostMedium: 'var(--mustard)',
    boostHigh: 'var(--gold)',
    boostPremium: 'var(--golden-rod',
    // Misc
    defaultRadius: '5px'
  }
}

export default function Config(state = initialState, action = {}) {
  switch (action.type) {
    case ConfigConstants.FETCH_ERROR:
      return state

    case ConfigConstants.FETCH_SUCCESS:
      return state

    default:
      return state
  }
}

export const initialState
