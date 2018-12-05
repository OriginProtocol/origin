import { Component } from 'react'
import { withRouter } from 'react-router'

class Customize extends Component {

  async loadCustomConfig() {
    return {
      name: 'Micah\'s Chicken Rental',
      logo: 'ipfs://QmRAQB6YaCyidP37UdDnjFY5vQuiBrcqdyoW1CuDgwxkD4',
      about: 'A place to rent quality chickens',
      envVars: {
        'AFFILIATE_ACCOUNT': '0x7aD0fa0E2380a5e0208B25AC69216Bd7Ff206bF8',
        'ARBITRATOR_ACCOUNT': '0x7aD0fa0E2380a5e0208B25AC69216Bd7Ff206bF8'
      },
      cssVars: {
        'heading-font': ['Courier', 'Georgia', 'serif'],
        'default-font': ['Palatino', 'Times', 'serif'],
        'background': '#FFFF00',
        'dark': '#FF0000',
        'dark-two': '#00FF00',
        'light': '#0044FF',
        'clear-blue': '#FF0000',
        'pale-clear-blue': '#FF0000',
        'dark-grey-blue': '#0000FF',
        'dark-clear-blue': '#FF0000',
        'dark-grey': '#FF0000',
        'pale-grey': '#6666FF',
        'pale-grey-two': '#FF0000',
        'pale-grey-three': '#FF0000',
        'pale-grey-four': '#0000FF',
        'pale-grey-five': '#FF0000',
        'pale-grey-six': '#FF0000',
        'pale-grey-seven': '#0000FF',
        'pale-grey-two-darker': '#FF0000',
        'pale-grey-eight': '#FF0000',
        'dusk': '#0000FF',
        'light-dusk': '#FF0000',
        'steel': '#FF0000',
        'greenblue': '#0000FF',
        'pale-greenblue': '#FF0000',
        'pale-yellow': '#FF0000',
        'mustard': '#0000FF',
        'gold': '#FF0000',
        'golden-rod': '#FF0000',
        'golden-rod-light': 'rgba(244, 193, 16, 0.1)',
        'light-greenblue': '#0000FF',
        'bluish-purple': '#FF0000',
        'bluey-grey': '#0000FF',
        'dark-blue-grey': '#FF0000',
        'orange-red': '#0000FF',
        'orange-red-light': '(255, 26, 26, 0.03)',
        'red': '#FF0000',
        'dark-red': '#0000FF',
        'light-red': '#FF0000',
        'dark-purple': '#FF0000',
        'light-footer': '#3fdc35'
      }
    }
  }

  componentDidMount() {
    // Sample at:
    // https://gist.githubusercontent.com/wanderingstan/d603b85ae5640f09de6da80dff21af5e/raw/a7ebf6508c91221236c02414dd49bd466feb8b75/dappConfig.js'
    // http://localhost:3000/?configUrl=https%3A%2F%2Fgist.githubusercontent.com%2Fwanderingstan%2Fd603b85ae5640f09de6da80dff21af5e%2Fraw%2Fa7ebf6508c91221236c02414dd49bd466feb8b75%2FdappConfig.js#/
    const m = window.location.search.match(/configUrl=([^#]*)/)
    if (!m) {
      // No custom URL
      return
    }

    const configUrl = decodeURIComponent(m[1])
    console.log(`Configuring DApp based on file here URL:${configUrl}`)
    fetch(configUrl)
    .then(response => response.json())
    .then(dappConfig => {
      // CSS vars
      // Iterate over css vars and set them
      for (let [cssVarName, cssVarValue] of Object.entries(dappConfig.cssVars)) {
        if (cssVarValue.toString().match(/url *\(/)) {
          throw "url() not allowed in DApp custom css"
        }
        document.documentElement.style.setProperty(`--${cssVarName}`, cssVarValue);
      }

      // Page title
      if (dappConfig.name) {
        // TODO: How to handle localization?
        document.title = dappConfig.name
      }
      // Page about
      if (dappConfig.about) {
        document.querySelector('.light-footer .description>p').innerText = dappConfig.about
      }
    })

    // Can't set env vars at runtime. :(
    // https://stackoverflow.com/questions/51729775/node-programmatically-set-process-environment-variables-not-available-to-importe
    // process.env.AFFILIATE_ACCOUNT = '0xFFFFFFFF2380a5e0208B25AC69216Bd7Ff206bF8'
    // console.log(`process.env.AFFILIATE_ACCOUNT: ${process.env.AFFILIATE_ACCOUNT}`)
  }

  render() {
    return this.props.children
  }
}

export default withRouter(Customize)
