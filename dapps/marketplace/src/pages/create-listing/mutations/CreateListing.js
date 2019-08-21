import React, { useState } from 'react'
import { useMutation } from 'react-apollo'
import get from 'lodash/get'

// Note that this is NOT the same as this file. This `CreateListing`
// is under `origin-dapp/src/mutations`
import CreateListingMutation from 'mutations/CreateListing'

import TransactionError from 'components/TransactionError'
import WaitForTransaction from 'components/WaitForTransaction'
import Redirect from 'components/Redirect'

import AutoMutate from 'components/AutoMutate'

import withCanTransact from 'hoc/withCanTransact'
import withWallet from 'hoc/withWallet'
import withWeb3 from 'hoc/withWeb3'

import Store from 'utils/store'
const store = Store('sessionStorage')

import applyListingData from './_listingData'

const CreateMutationWaitModal = ({ waitFor, onCompleted, onClose }) => {
  if (!waitFor) return null

  return (
    <WaitForTransaction
      hash={waitFor}
      event="ListingCreated"
      onClose={() => onClose()}
    >
      {({ event }) => (
        <>
          <div className="spinner light" />
          <AutoMutate
            mutation={() => {
              store.set('create-listing', undefined)
              const { listingID } = event.returnValues
              onCompleted(listingID)
            }}
          />
        </>
      )}
    </WaitForTransaction>
  )
}

const CreateListing = props => {
  const [state, setState] = useState({})

  const netId = get(props, 'web3.networkId')

  const [createListing] = useMutation(CreateListingMutation, {
    onCompleted: ({ createListing }) => {
      setState({ ...state, waitFor: createListing.id })
    },
    onError: errorData =>
      setState({ ...state, waitFor: false, error: 'mutation', errorData })
  })

  if (state.redirect) {
    return <Redirect to={state.redirect} push />
  }

  return (
    <>
      <button
        className={props.className}
        onClick={() => {
          if (props.cannotTransact) {
            setState({
              ...state,
              error: props.cannotTransact,
              errorData: props.cannotTransactData
            })
            return
          }

          setState({ ...state, waitFor: 'pending' })

          const { walletProxy } = props

          const variables = applyListingData(props, {
            deposit: '0',
            depositManager: walletProxy,
            from: walletProxy
          })

          createListing({ variables })
        }}
        children={props.children}
      />
      <CreateMutationWaitModal
        waitFor={state.waitFor}
        onClose={() => setState({ ...state, waitFor: null })}
        onCompleted={listingID =>
          setState({
            ...state,
            redirect: `/create/${netId}-000-${listingID}/success`
          })
        }
      />
      {state.error && (
        <TransactionError
          reason={state.error}
          data={state.errorData}
          onClose={() => setState({ ...state, error: false })}
        />
      )}
    </>
  )
}

export default withWeb3(withWallet(withCanTransact(CreateListing)))
