import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import Modal from './modal'

import origin from '../services/origin'
import Store from '../Store'
import { showAlert } from '../actions/Alert'

const web3 = origin.contractService.web3

const networkNames = {
  1: 'Main',
  2: 'Morden',
  3: 'Ropsten',
  4: 'Rinkeby',
  42: 'Kovan',
  999: 'Localhost',
}
const supportedNetworkIds = [3, 4]
const ONE_SECOND = 1000
const ONE_MINUTE = ONE_SECOND * 60

const AccountUnavailable = () => (
  <Modal backdrop="static" data-modal="account-unavailable" isOpen={true}>
    <div className="image-container">
      <img src="images/flat_cross_icon.svg" role="presentation" />
    </div>
    <FormattedMessage
      id={ 'web3-provider.notSignedIntoMetaMask' }
      defaultMessage={ 'You are not signed in to MetaMask.' }
    />
    <br />
  </Modal>
)

// TODO (micah): potentially add a loading indicator
const Loading = () => null

const UnconnectedNetwork = () => (
  <Modal backdrop="static" data-modal="web3-unavailable" isOpen={true}>
    <div className="image-container">
      <img src="images/flat_cross_icon.svg" role="presentation" />
    </div>
    <FormattedMessage
      id={ 'web3-provider.connecting' }
      defaultMessage={ 'Connecting to network...' }
    />
  </Modal>
)

const UnsupportedNetwork = props => (
  <Modal backdrop="static" data-modal="web3-unavailable" isOpen={true}>
    <div className="image-container">
      <img src="images/flat_cross_icon.svg" role="presentation" />
    </div>
    <FormattedMessage
      id={ 'web3-provider.wrongNetwork' }
      defaultMessage={ 'MetaMask should be on {rinkeby} Network' }
      values={{ rinkeby: <strong>Rinkeby</strong> }}
    />
    <br />
    <FormattedMessage
      id={ 'web3-provider.currentNetwork' }
      defaultMessage={ 'Currently on {networkName}.' }
      values={{ networkName: props.currentNetworkName }}
    />
  </Modal>
)

const Web3Unavailable = () => (
  <Modal backdrop="static" data-modal="web3-unavailable" isOpen={true}>
    <div className="image-container">
      <img src="images/flat_cross_icon.svg" role="presentation" />
    </div>
    <FormattedMessage
      id={ 'web3-provider.installMetaMask' }
      defaultMessage={ 'Please use a web3-enabled browser or install the MetaMask extension.' }
    />
    <br />
    <a target="_blank" href="https://metamask.io/" rel="noopener noreferrer">
      <FormattedMessage
        id={ 'web3-provider.getMetaMask' }
        defaultMessage={ 'Get MetaMask' }
      />
    </a>
    <br />
    <a
      target="_blank"
      href="https://medium.com/originprotocol/origin-demo-dapp-is-now-live-on-testnet-835ae201c58"
      rel="noopener noreferrer"
    >
      <FormattedMessage
        id={ 'web3-provider.demoInstructions' }
        defaultMessage={ 'Full Instructions for Demo' }
      />
    </a>
  </Modal>
)

class Web3Provider extends Component {
  constructor(props) {
    super(props)

    this.interval = null
    this.networkInterval = null
    this.fetchAccounts = this.fetchAccounts.bind(this)
    this.fetchNetwork = this.fetchNetwork.bind(this)
    this.state = {
      accounts: [],
      accountsLoaded: false,
      networkConnected: null,
      networkId: null,
      networkError: null,
      provider: null,
    }
  }

  componentWillMount() {
    this.setState({ provider: web3.currentProvider })
  }

  /**
   * Start polling accounts, & network. We poll indefinitely so that we can
   * react to the user changing accounts or networks.
   */
  componentDidMount() {
    this.fetchAccounts()
    this.fetchNetwork()
    this.initPoll()
    this.initNetworkPoll()
  }

  /**
   * Init web3/account polling, and prevent duplicate interval.
   * @return {void}
   */
  initPoll() {
    if (!this.interval) {
      this.interval = setInterval(this.fetchAccounts, ONE_SECOND)
    }
  }

  /**
   * Init network polling, and prevent duplicate intervals.
   * @return {void}
   */
  initNetworkPoll() {
    if (!this.networkInterval) {
      this.networkInterval = setInterval(this.fetchNetwork, ONE_MINUTE)
    }
  }

  /**
   * Update state regarding the availability of web3 and an ETH account.
   * @return {void}
   */
  fetchAccounts() {
    web3.currentProvider &&
      web3.eth &&
      web3.eth.getAccounts((err, accounts) => {
        if (err) {
          console.log(err)

          this.setState({ accountsError: err })
        } else {
          this.handleAccounts(accounts)
        }

        if (!this.state.accountsLoaded) {
          this.setState({ accountsLoaded: true })
        }
      })
  }

  handleAccounts(accounts) {
    let next = accounts[0]
    let curr = this.state.accounts[0]
    next = next && next.toLowerCase()
    curr = curr && curr.toLowerCase()

    if (curr !== next) {
      this.setState({
        accountsError: null,
        accounts
      })

      // force reload instead of showing alert
      curr && window.location.reload()
    }
  }

  /**
   * Get the network and update state accordingly.
   * @return {void}
   */
  fetchNetwork() {
    let called = false

    web3.currentProvider &&
      web3.version &&
      web3.eth.net.getId((err, netId) => {
        called = true

        const networkId = parseInt(netId, 10)

        if (err) {
          this.setState({
            networkError: err
          })
        } else {
          if (networkId !== this.state.networkId) {
            this.setState({
              networkError: null,
              networkId
            })
          }
        }

        if (!this.state.networkConnected) {
          this.setState({
            networkConnected: true
          })
        }
      })

    // Delay and condition the use of the network value.
    // https://github.com/MetaMask/metamask-extension/issues/1380#issuecomment-375980850
    if (this.state.networkConnected === null) {
      setTimeout(() => {
        !called &&
          web3 &&
          web3.version &&
          (web3.version.network === 'loading' || !web3.version.network) &&
          this.setState({
            networkConnected: false
          })
      }, 4000)
    }
  }

  render() {
    const { accounts, accountsLoaded, networkConnected, networkId, provider } = this.state
    const currentNetworkName = networkNames[networkId]
      ? networkNames[networkId]
      : networkId
    const inProductionEnv = true //
      //window.location.hostname === 'demo.originprotocol.com'

    if (!provider) {
      return <Web3Unavailable />
    }

    if (networkConnected === false) {
      return <UnconnectedNetwork />
    }

    if (
      networkId &&
      inProductionEnv &&
      supportedNetworkIds.indexOf(networkId) < 0
    ) {
      return <UnsupportedNetwork currentNetworkName={currentNetworkName} />
    }

    if (!accountsLoaded) {
      return <Loading />
    }

    if (!accounts.length) {
      return <AccountUnavailable />
    }

    return this.props.children
  }
}

export default Web3Provider
