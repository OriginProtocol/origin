import { Component } from 'react'
import { withRouter } from 'react-router'

class Customize extends Component {

  componentDidMount() {
    const dappConfig = {
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
    for (let [cssVarName, cssVarValue] of Object.entries(dappConfig.cssVars)) {
      document.documentElement.style.setProperty(`--${cssVarName}`, cssVarValue);
    }

    // Can't set env vars at runtime. :(
    // https://stackoverflow.com/questions/51729775/node-programmatically-set-process-environment-variables-not-available-to-importe
    // process.env.AFFILIATE_ACCOUNT = '0xFFFFFFFF2380a5e0208B25AC69216Bd7Ff206bF8'
    // console.log(`process.env.AFFILIATE_ACCOUNT: ${process.env.AFFILIATE_ACCOUNT}`)
  }

  componentDidUpdate(prevProps) {
    console.log('customize in da house!')
  }

  render() {
    return this.props.children
  }
}

export default withRouter(Customize)
