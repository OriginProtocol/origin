'use strict'

/* This is a HOC for providing web3 account functions.
 *
 * It uses redux for state and passes methods to wrapped components. In some
 * areas it emits events for other components to hook into
 * (e.g. add/removal of accounts).
 *
 * It interacts with the global web3 object to perform web3 functions.
 */

import React, { Component } from 'react'
import { DeviceEventEmitter } from 'react-native'
import { connect } from 'react-redux'
import { ethers } from 'ethers'
const bip39 = require('bip39')

import {
  addAccount,
  removeAccount,
  setAccountActive,
  setAccountBalances,
  setMessagingKeys
} from 'actions/Wallet'
import { PROMPT_MESSAGE, PROMPT_PUB_KEY } from '../constants'

const withWeb3Accounts = WrappedComponent => {
  class WithWeb3Accounts extends Component {
    componentWillMount() {
      // Make sure there is an active account that is valid
      const { wallet } = this.props
      // Ensure there is a valid active account, and if not set one
      let hasValidActiveAccount = false
      if (wallet.activeAccount) {
        hasValidActiveAccount = wallet.accounts.find(
          a => a.address === wallet.activeAccount.address
        )
      }
      // Setup the active account
      if (wallet.accounts.length) {
        const activeAccount = hasValidActiveAccount
          ? wallet.activeAccount
          : wallet.accounts[0]
        this.setAccountActive(activeAccount)
      }
    }

    /* Generate the signatures required for activating messaging
     */
    generateMessagingKeys = async () => {
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
        const signatureKey = await global.web3.eth.accounts
          .sign(PROMPT_MESSAGE, privateKey)
          .signature.substring(0, 66)
        const msgAccount = global.web3.eth.accounts.privateKeyToAccount(
          signatureKey
        )
        const pubMessage = PROMPT_PUB_KEY + msgAccount.address
        const pubSignature = await global.web3.eth.accounts.sign(
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
    createAccount = () => {
      const mnemonic = bip39.generateMnemonic()
      // This is the default path but explicitly stated here for clarity
      const derivePath = `m/44'/60'/0'/0/0`
      // Web3js doesn't support wallet creation from a mnemonic, so somewhat
      // redundantly we have to include ethersjs. Perhaps migrate everything
      // away from web3js to ethersjs or the functionality will be added to web3js
      // sometime in the future, see:
      // https://github.com/ethereum/web3.js/issues/1594
      const account = ethers.Wallet.fromMnemonic(mnemonic, derivePath)
      this.addAccount({
        address: account.address,
        mnemonic: account.mnemonic,
        privateKey: account.privateKey
      })
    }

    /* Add a new account based on a mnemonic. If the first account
     * in the derivation path is used it will continue to try the next number
     * until an address that is unused is found.
     *
     * This function can be slow.
     */
    importAccountFromMnemonic = (mnemonic, maxRetries = 10) => {
      const existingAddresses = this.props.wallet.accounts.map(a => a.address)
      // Use a loop to try the next account in the derivation path
      for (let i = 0; i < maxRetries; i++) {
        // This is the default path but explicitly stated here for clarity
        const derivePath = `m/44'/60'/0'/0/${i}`
        // Web3js doesn't support wallet creation from a mnemonic, so somewhat
        // redundantly we have to include ethersjs. Perhaps migrate everything
        // away from web3js to ethersjs or the functionality will be added to web3js
        // sometime in the future, see:
        // https://github.com/ethereum/web3.js/issues/1594
        const account = ethers.Wallet.fromMnemonic(mnemonic, derivePath)
        if (!existingAddresses.includes(account.address)) {
          // Got an account we don't have, use that
          this.addAccount({
            address: account.address,
            mnemonic: account.mnemonic,
            privateKey: account.privateKey
          })
          return account
        }
      }
      throw new Error('Maximum addresses reached')
    }

    /* Add a new account based on a private key (this.state.value).
     */
    importAccountFromPrivateKey = privateKey => {
      if (!privateKey.startsWith('0x') && /^[0-9a-fA-F]+$/.test(privateKey)) {
        privateKey = '0x' + privateKey
      }
      const account = new ethers.Wallet(privateKey)
      this.addAccount({
        address: account.address,
        mnemonic: account.mnemonic,
        privateKey: account.privateKey
      })
      return account
    }

    /* Add a new account
     */
    addAccount = account => {
      this.props.addAccount(account)
      global.web3.eth.accounts.wallet.add(account)
      this.setAccountActive(account)
      // Emit addAccount, not used by any components at this time
      DeviceEventEmitter.emit('addAccount', account)
    }

    /* Remove an account
     */
    removeAccount = account => {
      const { wallet } = this.props
      const result = global.web3.eth.accounts.wallet.remove(account.address)
      this.props.removeAccount(account)
      if (wallet.activeAccount.address === account.address) {
        // The removed account was an active account, update the active account
        // to the first account found that is not the removed account
        this.setAccountActive(
          wallet.accounts.find(a => a.address !== account.address || null)
        )
      }
      // Emit removeAccount, used by PushNotification component to unregister the
      // account from the notifications server
      DeviceEventEmitter.emit('removeAccount', account)
      return result
    }

    /* Set the account that should be used for web3 interactions and ensure it is
     * configured for messaging and notifications
     */
    setAccountActive = account => {
      this.props.setAccountActive(account)
      // Generate messaging keys
      this.generateMessagingKeys()
    }

    /* Get a list of available accounts, returning the active account as the first
     * in the array
     */
    getAccounts = () => {
      const { wallet } = this.props
      let accounts
      if (wallet.activeAccount) {
        const filteredAccounts = wallet.accounts.filter(
          a => a.address !== wallet.activeAccount.address
        )
        accounts = [
          wallet.activeAccount.address,
          ...filteredAccounts.map(a => a.address)
        ]
      } else {
        accounts = wallet.accounts
      }
      return accounts
    }

    /* Sign a transaction using web3 and the currently active account
     */
    signTransaction = transaction => {
      const { wallet } = this.props
      if (transaction.from !== wallet.activeAccount.address.toLowerCase()) {
        console.error('Account mismatch')
        return null
      }
      return global.web3.eth.accounts.signTransaction(
        transaction,
        wallet.activeAccount.privateKey
      )
    }

    /* Sign a message using web3 and the currently active account
     */
    signMessage = data => {
      const { wallet } = this.props
      if (data.from !== wallet.activeAccount.address.toLowerCase()) {
        console.error('Account mismatch')
        return null
      }
      return global.web3.eth.accounts.sign(
        data.data,
        wallet.activeAccount.privateKey
      )
    }

    /* Send a transaction using web3
     */
    sendTransaction = transaction => {
      return global.web3.eth.sendTransaction(transaction)
    }

    render() {
      return (
        <WrappedComponent
          generateMessagingKeys={this.generateMessagingKeys}
          createAccount={this.createAccount}
          importAccountFromMnemonic={this.importAccountFromMnemonic}
          importAccountFromPrivateKey={this.importAccountFromPrivateKey}
          removeAccount={this.removeAccount}
          setAccountActive={this.setAccountActive}
          getAccounts={this.getAccounts}
          signTransaction={this.signTransaction}
          signMessage={this.signMessage}
          sendTransaction={this.sendTransaction}
          {...this.props}
        />
      )
    }
  }

  const mapStateToProps = ({ settings, wallet }) => {
    return { settings, wallet }
  }

  const mapDispatchToProps = dispatch => ({
    addAccount: account => dispatch(addAccount(account)),
    removeAccount: account => dispatch(removeAccount(account)),
    setAccountActive: payload => dispatch(setAccountActive(payload)),
    setAccountBalances: balances => dispatch(setAccountBalances(balances)),
    setMessagingKeys: payload => dispatch(setMessagingKeys(payload))
  })

  return connect(
    mapStateToProps,
    mapDispatchToProps
  )(WithWeb3Accounts)
}

export default withWeb3Accounts
