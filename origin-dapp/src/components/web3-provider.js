import React, { Component, Fragment } from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import clipboard from 'clipboard-polyfill'
import QRCode from 'qrcode.react'
import queryString from 'query-string'

import { detectMessagingEnabled } from 'actions/Activation'
import { storeWeb3Intent, storeNetwork } from 'actions/App'
import { fetchProfile } from 'actions/Profile'
import { getEthBalance, storeAccountAddress } from 'actions/Wallet'

import Modal from 'components/modal'

import getCurrentNetwork, {
  supportedNetwork,
  supportedNetworkId
} from 'utils/currentNetwork'
import getCurrentProvider from 'utils/getCurrentProvider'
import { formattedAddress } from 'utils/user'

import origin from '../services/origin'

const { web3 } = origin.contractService

const walletLandingUrl = process.env.WALLET_LANDING_URL
const mainnetDappBaseUrl = process.env.MAINNET_DAPP_BASEURL
const rinkebyDappBaseUrl = process.env.RINKEBY_DAPP_BASEURL
const instructionsUrl = process.env.INSTRUCTIONS_URL
const ONE_SECOND = 1000
const ONE_MINUTE = ONE_SECOND * 60

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

const LinkerPopUp = ({ linkerCode, mobileDevice, web3Intent, handleCancel, handleLinker }) => {
  let role

  if (web3Intent.match('purchase')) {
    role = 'buyer'
  } else if (web3Intent.match('create')) {
    role = 'seller'
  }

  return (
    <Modal backdrop="static" className="not-web3-enabled linker-popup" isOpen={true}>
     <a
        className="close"
        aria-label="Close"
        onClick={handleCancel}
      >
        <span aria-hidden="true">&times;</span>
      </a>
      {mobileDevice && (
        <Fragment>
          <div style={{ marginBottom: '10px' }}>
            To {web3Intent}, link your Origin Wallet with this code:<br />
            <pre className="d-inline-block" style={{
              background: 'white',
              borderRadius: '4px',
              marginTop: '10px',
              padding: '0.5rem',
            }}>
              {linkerCode}
            </pre>
          </div>
          <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => handleLinker(role)}>
            Copy &amp; Open App
          </button>
        </Fragment>
      )}
      {!mobileDevice && (
        <Fragment>
          <div style={{ marginBottom: '20px' }}>
            To {web3Intent}, link your Origin Wallet by scanning the QR code with your phone&apos;s camera:<br />
          </div>
          <div style={{ backgroundColor: 'white', padding: '50px' }}>
            <QRCode value={`${walletLandingUrl}/${linkerCode}${role ? `?role=${role}`: ''}`} />
            <pre className="mb-0 mt-3">
              {linkerCode}
            </pre>
          </div>
        </Fragment>
      )}
    </Modal>
  )
}

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
  <Modal backdrop="static" className="account-unavailable" isOpen={true}>
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

const UnsupportedNetwork = props => {
  const { currentNetworkName, currentProvider, networkId, supportedNetworkName } = props
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
      className="unsupported-provider web3-unavailable"
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
  <Modal backdrop="static" className="web3-unavailable" isOpen={true}>
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
    this.handleLinker = this.handleLinker.bind(this)
    this.state = {
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

  updateSearchWalletLinker() {
    const { location } = this.props
    const search = location.search || window.location.search

    if (this.latestSearch != search) {
      this.latestSearch = search

      const query = queryString.parse(search)
      const plink = query['plink']

      if (plink) {
        origin.contractService.walletLinker.preLinked(plink)
      }

      const testWalletLinker = query['testWalletLinker']

      if (testWalletLinker == '1') {
        origin.contractService.activeWalletLinker = true
      }
    }
  }

  getWalletReturnUrl() {
    const isMobileDevice = this.props.mobileDevice
    const now = this.props.location.pathname

    if (isMobileDevice) {
      if (now.startsWith('/listing/')) {
        const url = new URL(window.location)

        url.hash = '#/my-purchases'

        return url.href
      } else if (now.startsWith('/create')) {
        const url = new URL(window.location)

        url.hash = '#/my-listings'

        return url.href
      } else {
        return window.location.href
      }
    } else {
      return ''
    }
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

    if (origin.contractService.walletLinker) {
      origin.contractService.walletLinker.showPopUp = this.showLinkerPopUp.bind(this)

      if (!origin.contractService.walletLinker.setLinkCode) {
        origin.contractService.walletLinker.setLinkCode = this.setLinkerCode.bind(this)
      }

      origin.contractService.walletLinker.showNextPage = this.showNextPage.bind(this)

      this.updateSearchWalletLinker()
    }
  }

  componentDidUpdate() {
    if (origin.contractService.walletLinker) {
      this.updateSearchWalletLinker()
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

    if (now.startsWith('/listing/')) {
      this.props.history.push('/my-purchases')
    } else if (now.startsWith('/create')) {
      this.props.history.push('/my-listings')
    }
  }

  /**
   * Init web3/account polling, and prevent duplicate interval.
   * @return {void}
   */
  initAccountsPoll() {
    if (!this.accountsInterval && (!web3.currentProvider.isOrigin || origin.contractService.walletLinker)) {
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
    if (!web3.currentProvider.isOrigin) {
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
    const previousNetworkId = this.props.networkId

    providerExists &&
      web3.version &&
      web3.eth.net.getId((err, netId) => {
        const networkId = parseInt(netId, 10)

        if (err) {
          this.setState({
            networkError: err
          })
        } else if (networkId !== previousNetworkId) {
          this.props.storeNetwork(networkId)
          this.setState({
            networkError: null
          })

          // switch from one second to one minute after change
          clearInterval(this.networkInterval)

          this.networkInterval = setInterval(this.fetchNetwork, ONE_MINUTE)
        }
      })
  }

  handleAccounts(accounts) {
    const { messagingInitialized, storeAccountAddress, wallet } = this.props
    const current = accounts[0]
    const previous = wallet.address ? formattedAddress(wallet.address) : null
    const walletLinkerEnabled = origin.contractService.isActiveWalletLinker()

    // on account detection
    if (formattedAddress(current) !== previous) {
      // TODO: fix this with some route magic!
      if (
        !walletLinkerEnabled ||
        previous || ['/my-listings', '/my-purchases','/my-sales'].includes(this.props.location.pathname) ||
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

      if (current && !messagingInitialized) {
        // trigger messaging service
        origin.messaging.onAccount(current)
        // check after initializing messaging
        this.props.detectMessagingEnabled(current)
      }
    }
  }

  async handleLinker(role) {
    try {
      await clipboard.writeText(`orgw:${this.state.linkerCode}`)

      window.open(`${walletLandingUrl}${role ? `?role=${role}` : ''}`)
    } catch(e) {
      console.error(e)
    }
  }

  render() {
    const { mobileDevice, networkId, storeWeb3Intent, wallet, web3Intent } = this.props
    const { currentProvider, linkerCode, linkerPopUp } = this.state
    const currentNetwork = getCurrentNetwork(networkId) || {}
    const currentNetworkName = currentNetwork.name || networkId
    const isProduction = process.env.NODE_ENV === 'production'
    const networkNotSupported = supportedNetworkId !== networkId
    const supportedNetworkName = supportedNetwork && supportedNetwork.name
    const walletLinkerEnabled = origin.contractService.isActiveWalletLinker() 

    return (
      <Fragment>
        {/* currentProvider should always be present */
          !currentProvider && <Web3Unavailable mobileDevice={mobileDevice} />}

        {/* production  */
          currentProvider &&
          networkId &&
          isProduction &&
          networkNotSupported &&
          <UnsupportedNetwork
            currentNetworkName={currentNetworkName}
            currentProvider={currentProvider}
            networkId={networkId}
            supportedNetworkName={supportedNetworkName}
          />
        }

        {/* attempting to use web3 in unsupported mobile browser */
          web3Intent &&
          !walletLinkerEnabled &&
          web3.currentProvider.isOrigin &&
          mobileDevice && (
            <NotWeb3EnabledMobile
              web3Intent={web3Intent}
              storeWeb3Intent={storeWeb3Intent}
            />
          )}

        {/* attempting to use web3 in unsupported desktop browser */
          web3Intent &&
          !walletLinkerEnabled &&
          web3.currentProvider.isOrigin &&
          !mobileDevice && (
            <NotWeb3EnabledDesktop
              web3Intent={web3Intent}
              storeWeb3Intent={storeWeb3Intent}
            />
          )}

        { /* attempting to use web3 in unsupported desktop browser */
          web3Intent &&
          walletLinkerEnabled &&
          web3.currentProvider.isOrigin &&
          linkerCode &&
          linkerPopUp && (
            <LinkerPopUp
              linkerCode={linkerCode}
              mobileDevice={mobileDevice}
              handleCancel={() => {
                storeWeb3Intent(null)

                origin.contractService.walletLinker.cancelLink()
              }}
              handleLinker={this.handleLinker}
              web3Intent={web3Intent}
            />
          )
        }


        { /* attempting to use web3 without being signed in */
          web3Intent &&
          !web3.currentProvider.isOrigin &&
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
    messagingRequired: app.messagingRequired,
    mobileDevice: app.mobileDevice,
    networkId: app.web3.networkId,
    wallet,
    web3Intent: app.web3.intent
  }
}

const mapDispatchToProps = dispatch => ({
  detectMessagingEnabled: addr => dispatch(detectMessagingEnabled(addr)),
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
