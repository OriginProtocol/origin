import React from 'react'

import camelToDash from 'utils/camelToDash'


class Configuration extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      config: {
        title: '',
        about: '',
        subdomain: '',
        logoUrl: '',
        faviconUrl: '',
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
          dusk: '#455d75', // Navbar colour
          lightDusk: '#889fb7',
          steel: '#6f8294',
          greenblue: '#26d198',
          paleGreenblue: '#f5fcfa',
          paleYellow: '#fcf0c3',
          mustard: '#fae088',
          gold: '#f7d14c',
          goldenRod: '#f4c110',
          goldenRodLight: 'rgba(244, 193, 16, 0.1)',
          lightGreenblue: '#59ffcb',
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
        },
        filters: {
          listings: {}
        },
        marketplacePublisher: ''

      },
      loading: true
    }

    this.getConfigUrl = this.getConfigUrl.bind(this)
    this.setConfig = this.setConfig.bind(this)
  }

  async componentDidMount() {
    const configUrl = this.getConfigUrl()

    if (configUrl) {
      // Configuration is being loaded from a URL
      await fetch(configUrl)
        .then(response => this.setState({ config: response }))
        .catch((error) => {
          console.log('Could not set custom configuration: ' + error)
        })
    }

    this.setConfig()
  }

  getConfigUrl () {
    // Config override specified as URL parameter
    const configUrl = this.getConfigOverrideUrl()
    if (configUrl) {
      return configUrl
    } else if (this.isWhiteLabelHostname()) {
      // Retrieve the config from config.hostname via IPNS
      return
    }
  }

  getConfigOverrideUrl () {
    const configUrlMatch = window.location.search.match(/config=([^#&]*)/)
    return configUrlMatch ? decodeURIComponent(configUrlMatch[1]) : false
  }

  setConfig () {
    // CSS vars
    for (const [cssVarName, cssVarValue] of Object.entries(this.state.config.cssVars)) {
      if (cssVarValue.toString().match(/url *\(/)) {
        throw 'url() not allowed in DApp CSS variables'
      }

      document.documentElement.style.setProperty(
        `--${camelToDash(cssVarName)}`,
        cssVarValue
      )
    }

    // Page title
    if (this.state.config.title) {
      document.title = this.state.config.title
    }

    // Locale
    if (this.state.config.languageCode) {
      if (this.state.config.languageCode !== this.state.selectedLanguageCode) {
        store.set('preferredLang', this.state.config.languageCode)
        window.location.reload()
      }
    }

    if (this.state.config.faviconUrl) {
      let faviconElement = document.querySelector('link[rel="shortcut icon"]')
      if (!faviconElement) {
          faviconElement = document.createElement('link')
          faviconElement.setAttribute('rel', 'shortcut icon')
          const head = document.querySelector('head')
          head.appendChild(faviconElement)
      }
      faviconElement.setAttribute('href', this.state.config.faviconUrl)
    }

    this.setState({
      loading: false
    })
  }

  isWhiteLabelHostname () {
    const exceptionNeedles = [
      'originprotocol.com',
      'localhost',
      '127.0.0.1'
    ]
    return exceptionNeedles.find((needle) => {
      return window.location.hostname.includes(needle)
    }) === undefined
  }

  render() {
    return this.state.loading ? '' : this.props.children
  }
}

export default Configuration
