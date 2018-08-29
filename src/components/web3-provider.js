import React, { Component, Fragment } from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import clipboard from 'clipboard-polyfill'
import QRCode from 'qrcode.react'

import { storeWeb3Account, storeWeb3Intent } from 'actions/App'
import { fetchProfile } from 'actions/Profile'
import { getBalance } from 'actions/Wallet'

import Modal from 'components/modal'

import detectMobile from 'utils/detectMobile'
import getCurrentProvider from 'utils/getCurrentProvider'

import origin from '../services/origin'

const web3 = origin.contractService.web3
const productionHostname =
  process.env.PRODUCTION_DOMAIN || 'demo.originprotocol.com'

const networkNames = {
  1: 'Main Ethereum Network',
  2: 'Morden Test Network',
  3: 'Ropsten Test Network',
  4: 'Rinkeby Test Network',
  42: 'Kovan Test Network',
  999: 'Localhost'
}
const supportedNetworkIds = [3, 4]
const ONE_SECOND = 1000
const ONE_MINUTE = ONE_SECOND * 60

// TODO (micah): potentially add a loading indicator

const NotWeb3EnabledDesktop = props => (
  <Modal backdrop="static" className="not-web3-enabled" isOpen={true}>
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
        href="https://medium.com/originprotocol/origin-demo-dapp-is-now-live-on-testnet-835ae201c58"
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
    <FormattedMessage
      id={'web3-provider.notSignedIntoMetaMask'}
      defaultMessage={'You are not signed in to MetaMask.'}
    />
    <br />
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
      {detectMobile() && <button className="btn btn-primary" style={{width:"200px"}} onClick={() => 
        clipboard.writeText("orgw:"+ props.linkerCode).then( function(){
          let url = "https://www.originprotocol.com/mobile"
          console.log("Code copied to clipboard successfully... opening url", url)
          window.open(url)
        }, function(err){
          console.log("Error opening url")
        })                   
      }>
        Copy & Open App 
        </button>
      }
      <div style={{padding:'50px', backgroundColor:'white'}}>
      <QRCode value={"https://www.originprotocol.com/mobile/" + props.linkerCode}/>
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
        href="https://trustwalletapp.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-clear"
      >
        <FormattedMessage id={'web3-provider.trust'} defaultMessage={'Trust'} />
      </a>
    </div>
    <div className="button-container">
      <a
        href="https://www.cipherbrowser.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-clear"
      >
        <FormattedMessage
          id={'web3-provider.cipher'}
          defaultMessage={'Cipher'}
        />
      </a>
    </div>
    <div className="button-container">
      <a
        href="https://www.toshi.org/"
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-clear"
      >
        <FormattedMessage id={'web3-provider.toshi'} defaultMessage={'Toshi'} />
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

const UnsupportedNetwork = props => (
  <Modal backdrop="static" data-modal="web3-unavailable" isOpen={true}>
    <div className="image-container">
      <img src="images/flat_cross_icon.svg" role="presentation" />
    </div>
    <p>
      <FormattedMessage
        id={'web3-provider.shouldBeOnRinkeby'}
        defaultMessage={'{currentProvider} should be on Rinkeby Test Network'}
        values={{ currentProvider: props.currentProvider }}
      />
    </p>
    <FormattedMessage
      id={'web3-provider.currentlyOnNetwork'}
      defaultMessage={'Currently on {currentNetworkName}.'}
      values={{ currentNetworkName: props.currentNetworkName }}
    />
  </Modal>
)

const Web3Unavailable = props => (
  <Modal backdrop="static" data-modal="web3-unavailable" isOpen={true}>
    <div className="image-container">
      <img src="images/flat_cross_icon.svg" role="presentation" />
    </div>
    {(!props.onMobile || props.onMobile === 'Android') && (
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
          href="https://medium.com/originprotocol/origin-demo-dapp-is-now-live-on-testnet-835ae201c58"
        >
          <FormattedMessage
            id={'web3-provider.fullInstructionsForDemo'}
            defaultMessage={'Full Instructions for Demo'}
          />
        </a>
      </div>
    )}
    {props.onMobile &&
      props.onMobile !== 'Android' && (
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
          href="https://itunes.apple.com/us/app/toshi-ethereum/id1278383455"
        >
          <FormattedMessage
            id={'web3-provider.toshi'}
            defaultMessage={'Toshi'}
          />
        </a>&nbsp;&nbsp;|&nbsp;
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://itunes.apple.com/us/app/cipher-browser-ethereum/id1294572970"
        >
          <FormattedMessage
            id={'web3-provider.cipher'}
            defaultMessage={'Cipher'}
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
      linkerCode:"",
      linkerPopUp:false
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
        origin.contractService.walletLinker.showPopUp = this.showLinkerPopUp.bind(this);
        origin.contractService.walletLinker.setLinkCode = this.setLinkerCode.bind(this);
        origin.contractService.walletLinker.showNextPage = this.showNextPage.bind(this);
    }
  }

  showLinkerPopUp(linkerPopUp){
    this.setState({linkerPopUp})
  }

  setLinkerCode(linkerCode) {
    this.setState({linkerCode})
  }

  showNextPage() {
    let now = this.props.location.pathname
    if (now.startsWith("/listing/"))
    {
      this.props.history.push("/my-purchases")
    }
    else if (now.startsWith("/create"))
    {
      this.props.history.push("/my-listings")
    }
  }

  /**
   * Init web3/account polling, and prevent duplicate interval.
   * @return {void}
   */
  initAccountsPoll() {
    if (!this.accountsInterval) {
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

    let code = origin.contractService.getMobileWalletLink()
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
    const curr = accounts[0]
    const prev = this.props.web3Account

    // on account detection
    if (curr !== prev) {
      // update global state
      this.props.storeWeb3Account(curr)

      // TODO: fix this with some route magic!
      if(["/my-listings", "/my-purchases","/my-sales"].includes(this.props.location.pathname)) {
        // reload if changed from a prior account
        prev !== null && window.location.reload()
      } else {
        // load data on account change
        this.props.fetchProfile()
        this.props.getBalance()
      }

      // trigger messaging service
      origin.messaging.onAccount(curr)
    }
  }

  render() {
    const { onMobile, web3Account, web3Intent, storeWeb3Intent } = this.props
    const { networkConnected, networkId, provider, currentProvider, linkerCode, linkerPopUp } = this.state
    const currentNetworkName = networkNames[networkId]
      ? networkNames[networkId]
      : networkId
    const inProductionEnv = window.location.hostname === productionHostname
    const networkNotSupported = supportedNetworkIds.indexOf(networkId) < 0

    return (
      <Fragment>
        {/* currentProvider should always be present */
          !currentProvider && <Web3Unavailable onMobile={onMobile} />}

        {/* networkConnected initial state is null */
          currentProvider && networkConnected === false && <UnconnectedNetwork />}

        {/* production  */
          currentProvider &&
          networkId &&
          inProductionEnv &&
          networkNotSupported &&
          <UnsupportedNetwork currentNetworkName={currentNetworkName} currentProvider={currentProvider} />
        }

        { /* attempting to use web3 in unsupported desktop browser */
          web3Intent &&
          !web3.givenProvider &&
          linkerCode &&
          linkerPopUp &&
          <LinkerPopUp web3Intent={web3Intent} cancel={() => { storeWeb3Intent(null); origin.contractService.walletLinker.cancelLink() }} linkerCode={linkerCode} />
        }

        { /* attempting to use web3 without being signed in */
          web3Intent &&
          web3.givenProvider &&
          web3Account === undefined && (
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

const mapStateToProps = state => {
  return {
    web3Account: state.app.web3.account,
    web3Intent: state.app.web3.intent,
    onMobile: state.app.onMobile
  }
}

const mapDispatchToProps = dispatch => ({
  fetchProfile: () => dispatch(fetchProfile()),
  getBalance: () => dispatch(getBalance()),
  storeWeb3Account: addr => dispatch(storeWeb3Account(addr)),
  storeWeb3Intent: intent => dispatch(storeWeb3Intent(intent))
})

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Web3Provider)
)
