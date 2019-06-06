'use strict'

import React, { Component } from 'react'
import { DeviceEventEmitter } from 'react-native'
import { connect } from 'react-redux'
import CryptoJS from 'crypto-js'
import { ethers } from 'ethers'
import get from 'lodash.get'
const bip39 = require('bip39')

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
  PROMPT_MESSAGE,
  PROMPT_PUB_KEY
} from '../constants'
import withConfig from 'hoc/withConfig'


const withOriginWallet = (WrappedComponent) => {
  class WithOriginWallet extends Component {

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
      const wallet = ethers.Wallet.fromMnemonic(mnemonic, derivePath)
      this.addAccount({
        address: wallet.address,
        mnemonic: wallet.mnemonic,
        privateKey: wallet.privateKey
      })
    }

    /* Add a new account
     */
    addAccount = (account) => {
      this.props.addAccount(account)
      global.web3.eth.accounts.wallet.add(account)
      this.setAccountActive(account)
      DeviceEventEmitter.emit('addAccount', account)
    }

    /* Remove an account
     */
    removeAccount = (account) => {
      const { wallet } = this.props
      const result = global.web3.eth.accounts.wallet.remove(account.address)
      this.props.removeAccount(account)
      if (wallet.activeAccount.address === account.address) {
        // The removed account was an active account, update the active account
        // to the first account found that is not the removed account
        this.setAccountActive(wallet.accounts.find(a => a.address !== account.address || null))
      }
      DeviceEventEmitter.emit('removeAccount', account)
      return result
    }

    /* Set the account that should be used for web3 interactions and ensure it is
     * configured for messaging and notifications
     */
    setAccountActive = (account) => {
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
    signTransaction = (transaction) => {
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
    signMessage = (data) => {
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
    sendTransaction = (transaction) => {
      return global.web3.eth.sendTransaction(transaction)
    }

    render() {
      return (
        <WrappedComponent
          generateMessagingKeys={this.generateMessagingKeys}
          addAccount={this.addAccount}
          createAccount={this.createAccount}
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
    setAccountName: payload => dispatch(setAccountName(payload)),
    setAccountActive: payload => dispatch(setAccountActive(payload)),
    setAccountBalances: balances => dispatch(setAccountBalances(balances)),
    setMessagingKeys: payload => dispatch(setMessagingKeys(payload)),
  })

  return connect(mapStateToProps, mapDispatchToProps)(WithOriginWallet)
}

export default withOriginWallet
