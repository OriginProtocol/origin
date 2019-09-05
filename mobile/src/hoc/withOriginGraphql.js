'use strict'

/* Allows for the execution of GraphQL queries and mutations via the `window.gql`
 * client on the marketplace. This stores and resolves deferred promises to provide
 * a nicer interface to executing queries (i.e. standard promises rather than
 * having to use DeviceEventEmitter to emit/listen.
 */

import uuid from 'uuid/v1'
import React, { Component } from 'react'
import { DeviceEventEmitter } from 'react-native'
import { connect } from 'react-redux'
import get from 'lodash.get'

import { balance, identity, tokenBalance, wallet } from 'graphql/queries'
import { setAccountBalances, setIdentity } from 'actions/Wallet'
import { tokenBalanceFromGql } from 'utils/currencies'

// Update account balance frequency
// TODO make this reactive to contract calls that will change balance
const BALANCE_UPDATE_INTERVAL = 10000

// Update identity frequency
// TODO make this reactive to identity changes
const IDENTITY_UPDATE_INTERVAL = 10000

const withOriginGraphql = WrappedComponent => {
  class WithOriginGraphql extends Component {
    constructor(props) {
      super(props)

      this.state = {
        deferredPromises: []
      }
    }

    componentWillMount = () => {
      // Subscribe to GraphQL result events
      this.subscriptions = [
        DeviceEventEmitter.addListener(
          'graphqlResult',
          this._handleGraphqlResult
        ),
        DeviceEventEmitter.addListener('graphqlError', this._handleGraphqlError)
      ]

      // Update balance periodically
      this.balanceUpdater = setInterval(
        this.updateBalance,
        BALANCE_UPDATE_INTERVAL
      )
      // Update identity periodically for all accounts
      const updateAllIdentities = () => {
        return this.props.wallet.accounts.map(account =>
          this.updateIdentity(account.address)
        )
      }
      this.identityUpdater = setInterval(
        updateAllIdentities,
        IDENTITY_UPDATE_INTERVAL
      )
    }

    componentWillUnmount = () => {
      // Cleanup subscriptions to GraphQL result events
      if (this.subscriptions) {
        this.subscriptions.map(s => s.remove())
      }

      // Cleanup polling updates
      if (this.balanceUpdater) {
        clearInterval(this.balanceUpdater)
      }

      if (this.identityUpdater) {
        clearInterval(this.identityUpdater)
      }
    }

    _sendGraphqlQuery = (query, variables, fetchPolicy) => {
      const { promiseId, promise } = this._generatePromise()
      DeviceEventEmitter.emit(
        'graphqlQuery',
        promiseId,
        query,
        variables,
        fetchPolicy
      )
      return promise
    }

    _sendGraphqlMutation = (mutation, variables) => {
      const { promiseId, promise } = this._generatePromise()
      DeviceEventEmitter.emit('graphqlMutation', promiseId, mutation, variables)
      return promise
    }

    _generatePromise = () => {
      const promiseId = uuid()
      const promise = new Promise((resolve, reject) => {
        this.setState(prevState => {
          return {
            ...prevState,
            deferredPromises: {
              ...prevState.deferredPromises,
              [promiseId]: { resolve, reject }
            }
          }
        })
      })
      return { promiseId, promise }
    }

    _handleGraphqlResult = ({ id, response }) => {
      // Promise was not necessarily generated by this HOC
      // TODO move to redux?
      if (this.state.deferredPromises[id]) {
        this.state.deferredPromises[id].resolve(response)
      }
    }

    _handleGraphqlError = ({ id, error }) => {
      // Promise was not necessarily generated by this HOC
      // TODO move to redux?
      if (this.state.deferredPromises[id]) {
        this.state.deferredPromises[id].reject(error)
      }
    }

    getBalance = ethAddress => {
      return this._sendGraphqlQuery(balance, { id: ethAddress }, 'no-cache')
    }

    getTokenBalance = (ethAddress, token) => {
      return this._sendGraphqlQuery(
        tokenBalance,
        {
          id: ethAddress,
          token: token
        },
        'no-cache'
      )
    }

    getIdentity = async id => {
      return this._sendGraphqlQuery(identity, { id }, 'no-cache')
    }

    getWallet = () => {
      return this._sendGraphqlQuery(wallet)
    }

    updateIdentity = async address => {
      if (!this.props.marketplace.ready) {
        return
      }

      if (!address && this.props.wallet.activeAccount) {
        if (this.props.wallet.activeAccount) {
          address = this.props.wallet.activeAccount.address
        } else {
          return
        }
      }

      // Save this here in case of update while waiting for GraphQL response
      const network = `${this.props.settings.network.name}`

      let identityResult
      try {
        const graphqlResponse = await this.getIdentity(address)
        identityResult = get(graphqlResponse, 'data.web3.account.identity')
      } catch (error) {
        // Handle GraphQL errors for things like invalid JSON RPC response or we
        // could crash the app
        console.warn('Could not retrieve identity using GraphQL: ', error)
        return
      }

      if (identityResult && identityResult.id) {
        this.props.setIdentity({
          network,
          address,
          identity: identityResult
        })
      }
    }

    updateBalance = async () => {
      if (!this.props.wallet.activeAccount || !this.props.marketplace.ready) {
        return
      }

      // Save this here in case of update while waiting for GraphQL response
      const activeAddress = `${this.props.wallet.activeAccount.address}`
      const network = `${this.props.settings.network.name}`

      const balances = {}
      try {
        // Get ETH balance, decimals don't need modifying
        const ethBalanceResponse = await this.getBalance(activeAddress)

        balances['eth'] = Number(
          get(ethBalanceResponse.data, 'web3.account.balance.eth', 0)
        )

        balances['dai'] = tokenBalanceFromGql(
          await this.getTokenBalance(activeAddress, 'DAI')
        )

        balances['ogn'] = tokenBalanceFromGql(
          await this.getTokenBalance(activeAddress, 'OGN')
        )
      } catch (error) {
        console.warn('Could not retrieve balances using GraphQL: ', error)
      }

      this.props.setAccountBalances({
        network,
        address: activeAddress,
        balances
      })
    }

    render() {
      return (
        <WrappedComponent
          getBalance={this.getBalance}
          getIdentity={this.getIdentity}
          getTokenBalance={this.getTokenBalance}
          getWallet={this.getWallet}
          {...this.props}
        />
      )
    }
  }

  const mapStateToProps = ({ marketplace, settings, wallet }) => {
    return { marketplace, settings, wallet }
  }

  const mapDispatchToProps = dispatch => ({
    setIdentity: payload => dispatch(setIdentity(payload)),
    setAccountBalances: balance => dispatch(setAccountBalances(balance))
  })

  return connect(
    mapStateToProps,
    mapDispatchToProps
  )(WithOriginGraphql)
}

export default withOriginGraphql
