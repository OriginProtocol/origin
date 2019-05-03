'use strict'

/* This is a React component that provides web3 account function such as account
 * storage, transaction processing and message signing. It also deals with
 * requests and storage of notification permissions.
 *
 * It uses DeviceEventEmitter to communicate with other React components in the
 * wallet app. This is something of an anti-pattern and should probably be
 * refactored to use a HOC or the React context API. It is this way for legacy
 * reasons. Using events in this way is awkward due to other components needing
 * to also listen to events to get return values.
 */

import { Component } from 'react'
import { DeviceEventEmitter } from 'react-native'
import Web3 from 'web3'
import { connect } from 'react-redux'
import CryptoJS from 'crypto-js'

import OriginTokenContract from '@origin/contracts/build/contracts/OriginToken'
import TokenContract from '@origin/contracts/build/contracts/TestToken'

import { setNetwork } from 'actions/Settings'
import {
  addAccount,
  removeAccount,
  setAccountActive,
  setAccountBalances,
  setAccountName,
  setMessagingKeys
} from 'actions/Wallet'
import {
  BALANCE_POLL_INTERVAL,
  NETWORKS,
  PROMPT_MESSAGE,
  PROMPT_PUB_KEY
} from './constants'
import { get } from 'utils'
import { loadData, deleteData } from './tools'
import withConfig from 'hoc/withConfig'

class OriginWallet extends Component {
  constructor(props) {
    super(props)

    this.web3 = new Web3()

    DeviceEventEmitter.addListener('addAccount', this.addAccount.bind(this))
    DeviceEventEmitter.addListener(
      'createAccount',
      this.createAccount.bind(this)
    )
    DeviceEventEmitter.addListener(
      'setAccountName',
      this.props.setAccountName.bind(this)
    )
    DeviceEventEmitter.addListener(
      'setAccountActive',
      this.setAccountActive.bind(this)
    )
    DeviceEventEmitter.addListener(
      'removeAccount',
      this.removeAccount.bind(this)
    )
    DeviceEventEmitter.addListener(
      'signTransaction',
      this.signTransaction.bind(this)
    )
    DeviceEventEmitter.addListener(
      'sendTransaction',
      this.sendTransaction.bind(this)
    )
    DeviceEventEmitter.addListener('signMessage', this.signMessage.bind(this))
    DeviceEventEmitter.addListener('getBalances', this.getBalances.bind(this))
  }

  async componentDidMount() {
    this._migrateLegacyAccounts()
    this.initWeb3()
    this.initAccounts()
    this.balancePoller = setInterval(
      () => this.getBalances(),
      BALANCE_POLL_INTERVAL
    )
  }

  componentWillUnmount() {
    clearInterval(this.balancePoller)
  }

  componentDidUpdate(prevProps) {
    // Reinit web3 if the network we are using changes, this will cause a change
    // of provider to match
    if (prevProps.settings.network.name !== this.props.settings.network.name) {
      this.initWeb3()
      this.updateBalancesNow()
    }
  }

  /* Update balances now annd restart the balance poller in BALANCE_POLL_INTERVAL
   */
  updateBalancesNow() {
    clearInterval(this.balancePoller)
    this.getBalances()
    // Restart poller
    this.balancePoller = setInterval(
      () => this.getBalances(),
      BALANCE_POLL_INTERVAL
    )
  }

  /* Move accounts from the old method of storing them into the new redux store
   */
  async _migrateLegacyAccounts() {
    loadData('WALLET_STORE').then(async walletData => {
      if (walletData) {
        for (let i = 0; i < walletData.length; i++) {
          const data = walletData[i]
          if (data.crypt == 'aes' && data.enc) {
            let privateKey
            try {
              privateKey = CryptoJS.AES.decrypt(
                data.enc,
                'WALLET_PASSWORD'
              ).toString(CryptoJS.enc.Utf8)
            } catch (error) {
              console.warn('Failed to decrypt private key, malformed UTF-8?')
              // Try without UTF-8
              privateKey = CryptoJS.AES.decrypt(
                data.enc,
                'WALLET_PASSWORD'
              ).toString()
            }
            if (privateKey) {
              this.addAccount(privateKey)
              console.debug('Migrated legacy account')
            }
          }
        }
        deleteData('WALLET_STORE')
      }
    })
  }

  async _migrateLegacyDeviceTokens() {
    loadData('WALLET_INFO').then(async walletInfo => {
      if (walletInfo && walletInfo.deviceToken) {
        this.props.setDeviceToken(walletInfo.deviceToken)
        console.debug('Migrated legacy device token')
      }
      deleteData('WALLET_INFO')
    })
  }

  /* Set the provider for web3 to the provider for the current network in the
   * graphql configuration for the current network
   */
  async initWeb3() {
    // Verify that the saved network is valid
    const networkExists = NETWORKS.find(
      n => n.name === this.props.settings.network.name
    )
    if (!networkExists) {
      // Set to mainnet if for some reason the network doesn't exist
      await this.props.setNetwork(NETWORKS.find(n => n.id === 1))
    }
    const provider = this.props.config.provider
    console.debug(`Setting provider to ${provider}`)
    this.web3.setProvider(new Web3.providers.HttpProvider(provider, 20000))
  }

  /* Configure web3 using the accounts persisted in redux
   */
  initAccounts() {
    const { wallet } = this.props
    // Clear the web3 wallet to make sure we only have the accounts loaded
    // from the data store
    this.web3.eth.accounts.wallet.clear()
    // Load the accounts from the saved redux state into web3
    for (let i = 0; i < wallet.accounts.length; i++) {
      this.web3.eth.accounts.wallet.add(wallet.accounts[i])
    }
    const { length } = wallet.accounts
    console.debug(`Loaded Origin Wallet with ${length} accounts`)
    // Verify there is a valid active account, and if not set one
    let hasValidActiveAccount = false
    if (wallet.activeAccount) {
      hasValidActiveAccount = wallet.accounts.find(
        a => a.address === wallet.activeAccount.address
      )
    }

    // Setup the active account
    if (length) {
      const activeAccount = hasValidActiveAccount
        ? wallet.activeAccount
        : wallet.accounts[0]
      this.setAccountActive(activeAccount)
    }
  }

  /* Generate the signatures required for activating messaging
   */
  async generateMessagingKeys() {
    const { wallet } = this.props
    // Check if messaging keys need updaitng
    if (
      !wallet.messagingKeys ||
      wallet.messagingKeys.address !== wallet.activeAccount.address
    ) {
      // Messaging keys address is different to the active account address,
      // update messaging keys
      let privateKey = wallet.activeAccount.privateKey
      if (!privateKey.startsWith('0x') && /^[0-9a-fA-F]+$/.test(privateKey)) {
        privateKey = '0x' + privateKey
      }
      const signatureKey = await this.web3.eth.accounts
        .sign(PROMPT_MESSAGE, privateKey)
        .signature.substring(0, 66)
      const msgAccount = this.web3.eth.accounts.privateKeyToAccount(
        signatureKey
      )
      const pubMessage = PROMPT_PUB_KEY + msgAccount.address
      const pubSignature = await this.web3.eth.accounts.sign(
        pubMessage,
        privateKey
      ).signature
      const messagingKeys = {
        address: wallet.activeAccount.address,
        signatureKey,
        pubMessage,
        pubSignature
      }
      this.props.setMessagingKeys(messagingKeys)
      DeviceEventEmitter.emit('messagingKeys', messagingKeys)
    }
  }

  /* Create new account
   */
  async createAccount() {
    const wallet = this.web3.eth.accounts.wallet.create(1)
    const account = wallet[wallet.length - 1]
    this.props.addAccount(account)
    this.setAccountActive(account)
  }

  /* Add a new account
   */
  async addAccount(account) {
    this.props.addAccount(account)
    this.setAccountActive(account)
  }

  /* Remove an account
   */
  async removeAccount(account) {
    const { wallet } = this.props
    const result = this.web3.eth.accounts.wallet.remove(account.address)
    this.props.removeAccount(account)
    if (wallet.activeAccount.address === account.address) {
      // The removed account was an active account, update the active account
      // to the first account found that is not the removed account
      const newActiveAccount =
        wallet.accounts.find(a => a.address !== account.address) || null
      this.setAccountActive(newActiveAccount)
    }
    return result
  }

  /* Set the account that should be used for web3 interactions and ensure it is
   * configured for messaging and notifications
   */
  async setAccountActive(account) {
    await this.props.setAccountActive(account)
    // Generate messaging keys
    this.generateMessagingKeys()
  }

  /* Get ETH balances and balances of all tokens configured in the graphql
   * configuration for the currently set network
   */
  async getBalances() {
    const { wallet } = this.props

    if (wallet.accounts.length && wallet.activeAccount) {
      let ethBalance
      try {
        ethBalance = await this.web3.eth.getBalance(
          wallet.activeAccount.address
        )
      } catch (error) {
        console.debug('web3 connection failed')
        return
      }

      const tokens = [
        {
          id: this.props.config.OriginToken,
          type: 'OriginToken',
          name: 'Origin Token',
          symbol: 'OGN',
          decimals: '18',
          supply: '1000000000'
        },
        ...this.props.config.tokens
      ]

      const tokenBalances = {}
      for (const token of tokens) {
        const contractDef =
          token.type === 'OriginToken' ? OriginTokenContract : TokenContract
        const contract = new this.web3.eth.Contract(contractDef.abi, token.id)
        let balance
        // Contract call has been observed to fail when rapidly switching networks
        // so wrap it in a try/catch
        try {
          balance = await contract.methods
            .balanceOf(wallet.activeAccount.address)
            .call()
        } catch (error) {
          console.warn(`Could not get token balance: , ${error}`)
          // Use the previous balance if one exists so it doesn't get overwritten
          tokenBalances[token.symbol.toLowerCase()] = get(
            wallet.accountBalance,
            token.symbol.toLowerCase()
          )
          continue
        }
        // Divide by number of decimals for token
        balance = Number(
          this.web3.utils
            .toBN(balance)
            .div(this.web3.utils.toBN(10 ** token.decimals))
        )
        tokenBalances[token.symbol.toLowerCase()] = balance
      }

      this.props.setAccountBalances({
        eth: this.web3.utils.fromWei(ethBalance),
        ...tokenBalances
      })
    }
  }

  /* Sign a transaction using web3
   */
  async signTransaction(transaction) {
    const { wallet } = this.props
    if (transaction.from !== wallet.activeAccount.address.toLowerCase()) {
      console.error('Account mismatch')
      return null
    }
    const signedTransaction = await this.web3.eth.accounts.signTransaction(
      transaction,
      wallet.activeAccount.privateKey
    )
    DeviceEventEmitter.emit('transactionSigned', {
      transaction,
      signedTransaction
    })
    return signedTransaction
  }

  /* Sign a message using web3
   */
  async signMessage(data) {
    const { wallet } = this.props
    if (data.from !== wallet.activeAccount.address.toLowerCase()) {
      console.error('Account mismatch')
      return null
    }
    const signedMessage = await this.web3.eth.accounts.sign(
      data.data,
      wallet.activeAccount.privateKey
    )
    DeviceEventEmitter.emit('messageSigned', {
      data,
      signedMessage
    })
  }

  /* Send a transaction using web3
   */
  async sendTransaction(transaction) {
    this.web3.eth
      .sendTransaction(transaction)
      .on('transactionHash', hash => {
        console.debug('Transaction hash: ', hash)
        DeviceEventEmitter.emit('transactionHash', { transaction, hash })
      })
      .on('receipt', receipt => {
        console.debug('Transaction receipt: ', receipt)
        DeviceEventEmitter.emit('transactionReceipt', { transaction, receipt })
      })
      .on('error', (error, receipt) => {
        console.error(error, receipt)
      })
  }

  /* This is a renderless component
   */
  render() {
    return null
  }
}

const mapStateToProps = ({ settings, wallet }) => {
  return { settings, wallet }
}

const mapDispatchToProps = dispatch => ({
  addAccount: account => dispatch(addAccount(account)),
  removeAccount: account => dispatch(removeAccount(account)),
  setAccountName: payload => dispatch(setAccountName(payload)),
  setAccountActive: payload => dispatch(setAccountActive(payload)),
  setAccountBalances: balances => dispatch(setAccountBalances(balances)),
  setMessagingKeys: payload => dispatch(setMessagingKeys(payload)),
  setNetwork: network => dispatch(setNetwork(network))
})

export default withConfig(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(OriginWallet)
)
