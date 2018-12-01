import React, { Component, Fragment } from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import clipboard from 'clipboard-polyfill'
import QRCode from 'qrcode.react'

import { storeWeb3Intent, storeNetwork } from 'actions/App'
import { fetchProfile } from 'actions/Profile'
import { getEthBalance, storeAccountAddress } from 'actions/Wallet'

import Modal from 'components/modal'

import getCurrentNetwork, { supportedNetworkId } from 'utils/currentNetwork'
import detectMobile from 'utils/detectMobile'
import getCurrentProvider from 'utils/getCurrentProvider'
import { formattedAddress } from 'utils/user'

import origin from '../services/origin'

const { web3 } = origin.contractService

const mainnetDappBaseUrl = process.env.MAINNET_DAPP_BASEURL
const rinkebyDappBaseUrl = process.env.RINKEBY_DAPP_BASEURL
const instructionsUrl = process.env.INSTRUCTIONS_URL
const ONE_SECOND = 1000
const ONE_MINUTE = ONE_SECOND * 60

// TODO (micah): potentially add a loading indicator

const NotWeb3EnabledDesktop = props => (
  <Modal
    backdrop="static"
    className="not-web3-enabled"
    isOpen={true}
    tabIndex="-1"
  >
    <div className="image-container">
      <img src="images/metamask.png" role="presentation" />
    </div>
    <a
      className="close"
      aria-label="Close"
      onClick={() => props.storeWeb3Intent(null)}
    >
      <span aria-hidden="true">&times;</span>
    </a>
    <div>
      <FormattedMessage
        id={'web3-provider.intentRequiresMetaMask'}
        defaultMessage={'In order to {web3Intent}, you must install MetaMask.'}
        values={{ web3Intent: props.web3Intent }}
      />
    </div>
    <div className="button-container d-flex">
      <a
        href="https://metamask.io/"
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-clear"
      >
        <FormattedMessage
          id={'web3-provider.getMetaMask'}
          defaultMessage={'Get MetaMask'}
        />
      </a>
      <a
        href={instructionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-clear"
      >
        <FormattedMessage
          id={'web3-provider.fullInstructions'}
          defaultMessage={'Full Instructions'}
        />
      </a>
    </div>
  </Modal>
)

const LinkerPopUp = props => (
  <Modal backdrop="static" className="not-web3-enabled linker-popup" isOpen={true}>
   <a
      className="close"
      aria-label="Close"
      onClick={() => props.cancel()}
    >
      <span aria-hidden="true">&times;</span>
    </a>
    <div>
      To {props.web3Intent}, you can link with your Origin Mobile Wallet with this code: {props.linkerCode} <br />
      { detectMobile() && <button className="btn btn-primary" style={{ width: '200px' }} onClick={() =>
        clipboard.writeText('orgw:'+ props.linkerCode).then( function(){
          const url = 'https://www.originprotocol.com/mobile'
          window.open(url)
        }, function(){
          console.log('Error opening url')
        })
      }>
        Copy & Open App
        </button>
      }
      <div style={{ padding: '50px', backgroundColor: 'white' }}>
      <QRCode value={'https://www.originprotocol.com/mobile/' + props.linkerCode}/>
      </div>
    </div>
  </Modal>
)

const NotWeb3EnabledMobile = props => (
  <Modal backdrop="static" className="not-web3-enabled" isOpen={true}>
    <div className="ethereum image-container">
      <img src="images/ethereum.png" role="presentation" />
    </div>
    <a
      className="close"
      aria-label="Close"
      onClick={() => props.storeWeb3Intent(null)}
    >
      <span aria-hidden="true">&times;</span>
    </a>
    <div>
      <FormattedMessage
        id={'web3-provider.intentRequiresEthereumEnabledBrowser'}
        defaultMessage={
          'In order to {web3Intent}, you must use an Ethereum wallet-enabled browser.'
        }
        values={{ web3Intent: props.web3Intent }}
      />
    </div>
    <br />
    <div>
      <strong>
        <FormattedMessage
          id={'web3-provider.popularEthereumWallets'}
          defaultMessage={'Popular Ethereum Wallets'}
        />
      </strong>
    </div>
    <div className="button-container">
      <a
        href="https://wallet.coinbase.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-clear"
      >
        <FormattedMessage id={'web3-provider.coinbase'} defaultMessage={'Coinbase Wallet'} />
      </a>
    </div>
    <div className="button-container">
      <a
        href="https://trustwalletapp.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-clear"
      >
        <FormattedMessage id={'web3-provider.trust'} defaultMessage={'Trust Wallet'} />
      </a>
    </div>
  </Modal>
)

const NoWeb3Account = ({ currentProvider, storeWeb3Intent, web3Intent }) => (
  <Modal backdrop="static" data-modal="account-unavailable" isOpen={true}>
    <div className="image-container">
      <img
        src={`images/${
          currentProvider === 'MetaMask' ? 'metamask' : 'ethereum'
        }.png`}
        role="presentation"
      />
    </div>
    <a
      className="close"
      aria-label="Close"
      onClick={() => storeWeb3Intent(null)}
    >
      <span aria-hidden="true">&times;</span>
    </a>
    <div>
      <FormattedMessage
        id={'web3-provider.intentRequiresSignIn'}
        defaultMessage={
          'In order to {web3Intent}, you must sign in to {currentProvider}.'
        }
        values={{ web3Intent, currentProvider }}
      />
    </div>
    <div className="button-container">
      <button className="btn btn-clear" onClick={() => storeWeb3Intent(null)}>
        OK
      </button>
    </div>
  </Modal>
)

const UnconnectedNetwork = () => (
  <Modal backdrop="static" data-modal="web3-unavailable" isOpen={true}>
    <div className="image-container">
      <img src="images/flat_cross_icon.svg" role="presentation" />
    </div>
    <FormattedMessage
      id={'web3-provider.connecting'}
      defaultMessage={'Connecting to network...'}
    />
  </Modal>
)

const UnsupportedNetwork = props => {
  const { currentProvider, networkId, currentNetworkName, supportedNetworkName } = props
  const url = new URL(window.location)
  const path = url.pathname + url.hash
  const goToUrl = (url) => () => window.location.href = url + path
  const getRedirectInfo = () => {
    if (networkId === 1 && mainnetDappBaseUrl) {
      return { url: mainnetDappBaseUrl, label: 'Mainnet Beta' }
    } else if (networkId === 4 && rinkebyDappBaseUrl) {
      return { url: rinkebyDappBaseUrl, label: 'Testnet Beta' }
    }
  }
  const redirectInfo = getRedirectInfo()

  return (
    <Modal
      backdrop="static"
      className="unsupported-provider"
      data-modal="web3-unavailable"
      isOpen={true}>

      <div className="image-container">
        <img src="images/flat_cross_icon.svg" role="presentation" />
      </div>
      <p>
        <FormattedMessage
          id={'web3-provider.shouldBeOnRinkeby'}
          defaultMessage={'{currentProvider} should be set to {supportedNetworkName}.'}
          values={{ currentProvider, supportedNetworkName }}
        />
      </p>
      <FormattedMessage
        id={'web3-provider.currentlyOnNetwork'}
        defaultMessage={'It is currently on {currentNetworkName}.'}
        values={{ currentNetworkName }}
      />
      { redirectInfo && (
        <Fragment>
          <p className="redirect-message">
            <FormattedMessage
              id={'web3-provider.redirectMessage'}
              defaultMessage={'If you are looking for {label}, visit {url}.'}
              values={{ label: redirectInfo.label, url: redirectInfo.url }}
            />
          </p>
          <button
            className="btn btn-outline align-self-center redirect-btn"
            onClick={goToUrl(redirectInfo.url)}>

            <FormattedMessage
              id={'web3-provider.redirectInfoButton'}
              defaultMessage={'Go to {website}'}
              values={{ website: redirectInfo.label }}
            />
          </button>
        </Fragment>
      )}
    </Modal>
  )
}

const Web3Unavailable = ({ mobileDevice }) => (
  <Modal backdrop="static" data-modal="web3-unavailable" isOpen={true}>
    <div className="image-container">
      <img src="images/flat_cross_icon.svg" role="presentation" />
    </div>
    {(!mobileDevice || mobileDevice === 'Android') && (
      <div>
        <FormattedMessage
          id={'web3-provider.pleaseInstallMetaMask'}
          defaultMessage={
            'Please install the MetaMask extension to access this site.'
          }
        />
        <br />
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://metamask.io/"
        >
          <FormattedMessage
            id={'web3-provider.getMetaMask'}
            defaultMessage={'Get MetaMask'}
          />
        </a>
        <br />
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={instructionsUrl}
        >
          <FormattedMessage
            id={'web3-provider.fullInstructions'}
            defaultMessage={'Full Instructions'}
          />
        </a>
      </div>
    )}
    {mobileDevice && mobileDevice !== 'Android' && (
      <div>
        <FormattedMessage
          id={'web3-provider.useWalletEnabledBrowser'}
          defaultMessage={
            'Please access this site through a wallet-enabled browser:'
          }
        />
        <br />
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://itunes.apple.com/app/coinbase-wallet/id1278383455"
        >
          <FormattedMessage
            id={'web3-provider.coinbase'}
            defaultMessage={'Coinbase Wallet'}
          />
        </a>&nbsp;&nbsp;|&nbsp;
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://itunes.apple.com/ae/app/trust-ethereum-wallet/id1288339409"
        >
          <FormattedMessage
            id={'web3-provider.trustWallet'}
            defaultMessage={'Trust Wallet'}
          />
        </a>
      </div>
    )}
  </Modal>
)

class Web3Provider extends Component {
  constructor(props) {
    super(props)

    this.accountsInterval = null
    this.networkInterval = null
    this.fetchAccounts = this.fetchAccounts.bind(this)
    this.fetchNetwork = this.fetchNetwork.bind(this)
    this.handleAccounts = this.handleAccounts.bind(this)
    this.state = {
      networkConnected: null,
      networkId: null,
      networkError: null,
      currentProvider: getCurrentProvider(web3),
      provider: null,
      linkerCode: '',
      linkerPopUp: false
    }
  }

  async componentWillMount() {
    this.setState({ provider: web3.currentProvider })

  }

  /**
   * Start polling accounts and network. We poll indefinitely so that we can
   * react to the user changing accounts or networks.
   */
  componentDidMount() {
    this.fetchAccounts()
    this.fetchNetwork()
    this.initAccountsPoll()
    this.initNetworkPoll()
    if (origin.contractService.walletLinker)
    {
        origin.contractService.walletLinker.showPopUp = this.showLinkerPopUp.bind(this)
        origin.contractService.walletLinker.setLinkCode = this.setLinkerCode.bind(this)
        origin.contractService.walletLinker.showNextPage = this.showNextPage.bind(this)
    }
  }

  showLinkerPopUp(linkerPopUp){
    this.setState({ linkerPopUp })
  }

  setLinkerCode(linkerCode) {
    this.setState({ linkerCode })
  }

  showNextPage() {
    const now = this.props.location.pathname
    if (now.startsWith('/listing/'))
    {
      this.props.history.push('/my-purchases')
    }
    else if (now.startsWith('/create'))
    {
      this.props.history.push('/my-listings')
    }
  }

  /**
   * Init web3/account polling, and prevent duplicate interval.
   * @return {void}
   */
  initAccountsPoll() {
    if (!this.accountsInterval && (web3.givenProvider || origin.contractService.walletLinker)) {
      this.accountsInterval = setInterval(this.fetchAccounts, ONE_SECOND)
    }
  }

  /**
   * Init network polling, and prevent duplicate intervals.
   * @return {void}
   */
  initNetworkPoll() {
    if (!this.networkInterval) {
      this.networkInterval = setInterval(this.fetchNetwork, ONE_SECOND)
    }
  }

  /**
   * Update state regarding the availability of web3 and an ETH account.
   * @return {void}
   */
  fetchAccounts() {
    web3.eth.getAccounts((err, accounts) => {
      if (err) {
        console.error(err)
      } else {
        this.handleAccounts(accounts)
      }
    })

    if (web3.currentProvider !== this.state.provider) {
      // got a real provider now
      this.setState({ provider: web3.currentProvider })
    }

    // skip walletLink if browser is web3-enabled
    if (web3.givenProvider) {
      return
    }

    const code = origin.contractService.getMobileWalletLink()
    if (this.state.linkerCode != code) {
      // let's set the linker code
      this.setState({ linkerCode: code })
    }
  }

  /**
   * Get the network and update state accordingly.
   * @return {void}
   */
  fetchNetwork() {
    const providerExists = web3.currentProvider
    const networkConnected =
      web3.currentProvider.connected ||
      (typeof web3.currentProvider.isConnected === 'function' &&
        web3.currentProvider.isConnected())

    if (networkConnected !== this.state.networkConnected) {
      if (this.state.networkConnected !== null) {
        // switch from one second to one minute after change
        clearInterval(this.networkInterval)

        this.networkInterval = setInterval(this.fetchNetwork, ONE_MINUTE)
      }

      if (web3.currentProvider.connected !== undefined && web3.currentProvider.isConnected !== undefined)
      {
        this.setState({ networkConnected })
      }
    }

    providerExists &&
      web3.version &&
      web3.eth.net.getId((err, netId) => {
        const networkId = parseInt(netId, 10)

        if (err) {
          this.setState({
            networkError: err
          })
        } else {
          if (networkId !== this.state.networkId) {
            this.props.storeNetwork(networkId)
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
  }

  handleAccounts(accounts) {
    const { messagingInitialized, storeAccountAddress, wallet } = this.props
    const current = accounts[0]
    const previous = formattedAddress(wallet.address)
    const walletLinkerEnabled = origin.contractService.walletLinker

    // on account detection
    if (formattedAddress(current) !== formattedAddress(previous)) {
      // TODO: fix this with some route magic!
      if (
        !walletLinkerEnabled ||
        ['/my-listings', '/my-purchases','/my-sales'].includes(this.props.location.pathname) ||
        !current
      ) {
        // reload if changed from a prior account
        previous !== null && window.location.reload()
      } else {
        // load data on account change
        this.props.fetchProfile()
        this.props.getEthBalance()
      }

      // set user_id to wallet address in Google Analytics
      const gtag = window.gtag || function(){}

      gtag('set', { 'user_id': current })

      // update global state
      storeAccountAddress(current)
      // trigger messaging service
      origin.messaging.onAccount(current)
    }
  }

  render() {
    const { mobileDevice, wallet, web3Intent, storeWeb3Intent } = this.props
    const { currentProvider, linkerCode, linkerPopUp, networkConnected, networkId } = this.state
    const currentNetwork = getCurrentNetwork(networkId)
    const currentNetworkName = currentNetwork
      ? currentNetwork.name
      : networkId
    const isProduction = process.env.NODE_ENV === 'production'
    const networkNotSupported = supportedNetworkId !== networkId
    const walletLinkerEnabled = origin.contractService.walletLinker

    return (
      <Fragment>
        {/* currentProvider should always be present */
          !currentProvider && <Web3Unavailable mobileDevice={mobileDevice} />}

        {/* networkConnected initial state is null */
          currentProvider && networkConnected === false && <UnconnectedNetwork />}

        {/* production  */
          currentProvider &&
          networkId &&
          isProduction &&
          networkNotSupported &&
          <UnsupportedNetwork currentNetworkName={currentNetworkName} currentProvider={currentProvider} />
        }

        {/* attempting to use web3 in unsupported mobile browser */
          web3Intent &&
          !walletLinkerEnabled &&
          !web3.givenProvider &&
          mobileDevice && (
            <NotWeb3EnabledMobile
              web3Intent={web3Intent}
              storeWeb3Intent={storeWeb3Intent}
            />
          )}

        {/* attempting to use web3 in unsupported desktop browser */
          web3Intent &&
          !walletLinkerEnabled &&
          !web3.givenProvider &&
          !mobileDevice && (
            <NotWeb3EnabledDesktop
              web3Intent={web3Intent}
              storeWeb3Intent={storeWeb3Intent}
            />
          )}

        { /* attempting to use web3 in unsupported desktop browser */
          web3Intent &&
          walletLinkerEnabled &&
          !web3.givenProvider &&
          linkerCode &&
          linkerPopUp &&
          <LinkerPopUp web3Intent={web3Intent} cancel={() => { storeWeb3Intent(null); origin.contractService.walletLinker.cancelLink() }} linkerCode={linkerCode} />
        }


        { /* attempting to use web3 without being signed in */
          web3Intent &&
          web3.givenProvider &&
          wallet.address === undefined && (
            <NoWeb3Account
              web3Intent={web3Intent}
              storeWeb3Intent={storeWeb3Intent}
              currentProvider={currentProvider}
            />
          )}

        {this.props.children}
      </Fragment>
    )
  }
}

const mapStateToProps = ({ activation, app, wallet }) => {
  return {
    messagingInitialized: activation.messaging.initialized,
    mobileDevice: app.mobileDevice,
    wallet,
    web3Intent: app.web3.intent
  }
}

const mapDispatchToProps = dispatch => ({
  fetchProfile: () => dispatch(fetchProfile()),
  getEthBalance: () => dispatch(getEthBalance()),
  storeAccountAddress: addr => dispatch(storeAccountAddress(addr)),
  storeNetwork: networkId => dispatch(storeNetwork(networkId)),
  storeWeb3Intent: intent => dispatch(storeWeb3Intent(intent))
})

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Web3Provider)
)
