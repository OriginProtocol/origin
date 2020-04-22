import React, { useState, useEffect } from 'react'
import get from 'lodash/get'
import dayjs from 'dayjs'

import Modal from 'components/Modal'

const NoWeb3 = ({ setShouldClose }) => (
  <div className="affiliate-modal">
    <h3>Oops</h3>
    <div className="description">
      It appears you do not have a{' '}
      <a
        href="https://ethereum.org/wallets/"
        target="_blank"
        rel="noopener noreferrer"
      >
        web3 enabled browser
      </a>
      .
    </div>
    <button
      onClick={() => setShouldClose(true)}
      className="btn btn-primary"
      children="OK"
    />
  </div>
)

const ConnectWallet = ({ setState }) => (
  <div className="affiliate-modal connect">
    <h3>Connect your web3 wallet</h3>
    <div className="description">
      Please click “Connect” and open your web3 wallet manually if it does not
      do so automatically
    </div>
    <button
      onClick={() => {
        window.ethereum.enable().then(([account]) => {
          setState({ account })
        })
      }}
      className="btn btn-primary btn-lg"
    >
      Connect
    </button>
  </div>
)

const Login = ({ setState, dispatch, account }) => (
  <div className="affiliate-modal sign-request">
    <h3>Please sign the request</h3>
    <div className="description">
      You will be asked to sign a message in order to enable Origin Affiliates.
    </div>
    <button
      onClick={() => {
        const date = dayjs().toISOString()
        const msg = `OGN Affiliate Login ${date}`
        window.ethereum.send(
          {
            jsonrpc: '2.0',
            method: 'personal_sign',
            params: [msg, account],
            id: 1
          },
          (err, res) => {
            if (res.result) {
              dispatch({
                type: 'setAffiliate',
                affiliate: {
                  account,
                  sig: res.result,
                  msg,
                  toolbar: true
                }
              })
              setState({ mode: 'affiliate' })
            }
          }
        )
      }}
      className="btn btn-primary btn-lg"
    >
      Sign and Enable
    </button>
  </div>
)

const JoinModal = ({ setState, dispatch, state }) => {
  const hasEthereum = get(window, 'ethereum.enable') ? true : false
  const selectedAccount = get(window, 'ethereum.selectedAddress')
  const [account, setAccount] = useState(selectedAccount)
  const [shouldClose, setShouldClose] = useState()

  useEffect(() => {
    if (state.account) {
      setAccount(state.account)
    }
  }, [state.account])

  return (
    <Modal shouldClose={shouldClose} onClose={() => setState({ modal: false })}>
      <button className="close" onClick={() => setShouldClose(true)}>
        <span aria-hidden="true">&times;</span>
      </button>
      {!hasEthereum ? (
        <NoWeb3 {...{ setShouldClose }} />
      ) : account ? (
        <Login {...{ setState, account, dispatch, state }} />
      ) : (
        <ConnectWallet {...{ setState }} />
      )}
    </Modal>
  )
}

export default JoinModal

require('react-styl')(`
  .modal-content
    button.close
      position: absolute
      top: 0.5rem
      right: 0.75rem
      font-weight: 500

  .affiliate-modal
    display: flex
    flex-direction: column
    align-items: center
    padding: 2.5rem
    text-align: center
    h3
      font-size: 1.5rem
      font-weight: bold
    .description
      color: #666
      font-size: 1.125rem
      font-weight: normal
      margin-bottom: 2rem
      a
        color: #007dff
        text-decoration: underline
    .btn
      padding-left: 3rem
      padding-right: 3rem
    &.connect
      .description
        background-image: url(images/wallet-icon.svg)
        background-repeat: no-repeat
        background-position: center top
        padding-top: 8rem
        margin-top: 1rem
    &.sign-request
      .description
        background-image: url(images/affiliate-sign.svg)
        background-repeat: no-repeat
        background-position: center top
        padding-top: 8rem
        margin-top: 1rem
  @media (max-width: 767.98px)
    .affiliate-modal
      .btn
        padding-left: 2rem
        padding-right: 2rem

`)
