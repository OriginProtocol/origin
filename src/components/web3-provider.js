import React, { Component } from 'react'
import Layout from './layout'
import Modal from './modal'

const alertify = require('../../node_modules/alertify/src/alertify.js')

const networkNames = {
  1: "Main",
  2: "Morden",
  3: "Ropsten",
  4: "Rinkeby",
  42: "Kovan",
}
const supportedNetworkIds = [3, 4]
const ONE_SECOND = 1000
const ONE_MINUTE = ONE_SECOND * 60

const AccountUnavailable = (props) => (
  <div>
    <Layout {...props}>
      <Modal backdrop="static" data-modal="account-unavailable" isOpen={true}>
        <div className="image-container">
          <img src="/images/flat_cross_icon.svg" role="presentation"/>
        </div>
        You are not signed in to MetaMask.<br />
      </Modal>
    </Layout>
  </div>
)

// TODO (micah): potentially add a loading indicator
const Loading = (props) => (
  <div>
    <Layout {...props}>
    </Layout>
  </div>
)

const UnconnectedNetwork = (props) => (
  <div>
    <Layout {...props}>
      <Modal backdrop="static" data-modal="web3-unavailable" isOpen={true}>
        <div className="image-container">
          <img src="/images/flat_cross_icon.svg" role="presentation"/>
        </div>
        Connecting to network...
      </Modal>
    </Layout>
  </div>
)

const UnsupportedNetwork = (props) => (
  <div>
    <Layout {...props}>
      <Modal backdrop="static" data-modal="web3-unavailable" isOpen={true}>
        <div className="image-container">
          <img src="/images/flat_cross_icon.svg" role="presentation"/>
        </div>
        MetaMask should be on <strong>Rinkeby</strong> Network<br />
        Currently on {props.currentNetworkName}.
      </Modal>
    </Layout>
  </div>
)

const Web3Unavailable = (props) => (
  <div>
    <Layout {...props}>
      <Modal backdrop="static" data-modal="web3-unavailable" isOpen={true}>
        <div className="image-container">
          <img src="/images/flat_cross_icon.svg" role="presentation"/>
        </div>
        MetaMask extension not installed.<br />
        <a target="_blank" href="https://metamask.io/">Get MetaMask</a><br />
        <a target="_blank" href="https://medium.com/originprotocol/origin-demo-dapp-is-now-live-on-testnet-835ae201c58">
          Full Instructions for Demo
        </a>
      </Modal>
    </Layout>
  </div>
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
    }
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
    const { web3 } = window

    web3 && web3.eth && web3.eth.getAccounts((err, accounts) => {
      if (err) {
        console.log(err)

        this.setState({ accountsError: err })
      } else {
        this.handleAccounts(accounts)
      }

      if (!this.state.accountsLoaded) {
        this.setState({ accountsLoaded: true })
      }
    });
  }

  handleAccounts(accounts) {
    let next = accounts[0]
    let curr = this.state.accounts[0]
    next = next && next.toLowerCase()
    curr = curr && curr.toLowerCase()

    if (curr !== next) {
      curr && alertify.log('MetaMask account has changed.')

      this.setState({
        accountsError: null,
        accounts,
      })
    }
  }

  /**
   * Get the network and update state accordingly.
   * @return {void}
   */
  fetchNetwork() {
    const { web3 } = window

    web3 && web3.version && web3.version.getNetwork((err, netId) => {
      const networkId = parseInt(netId, 10)

      if (err) {
        this.setState({
          networkError: err
        })
      } else {
        if (networkId !== this.state.networkId) {
          this.setState({
            networkError: null,
            networkId,
          })
        }
      }

      if (!this.state.networkConnected) {
        this.setState({
          networkConnected: true,
        })
      }
    })

    web3 && web3.version && (web3.version.network === 'loading' || !web3.version.network) && this.setState({
      networkConnected: false,
    })
  }

  render() {
    const { web3 } = window
    const { accounts, accountsLoaded, networkConnected, networkId } = this.state
    const currentNetworkName = networkNames[networkId] ? networkNames[networkId] : networkId
    const inProductionEnv = window.location.hostname === 'demo.originprotocol.com'

    if (networkConnected === false) {
      return <UnconnectedNetwork />
    }

    if (!web3) {
      return <Web3Unavailable />
    }

    if (networkId && inProductionEnv && (supportedNetworkIds.indexOf(networkId) < 0)) {
      return <UnsupportedNetwork currentNetworkName={currentNetworkName} />
    }

    if (!accountsLoaded) {
      return <Loading/>
    }

    if (!accounts.length) {
      return <AccountUnavailable />
    }

    return this.props.children
  }
}

export default Web3Provider
