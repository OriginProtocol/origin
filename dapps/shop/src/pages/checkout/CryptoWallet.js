import React from 'react'

const CryptoWallet = ({ walletStatus }) => {
  if (walletStatus === 'no-web3') {
    return <div>Cannot query web3</div>
  } else if (walletStatus === 'no-wallet') {
    return <div className="alert alert-danger">No crypto wallet detected.</div>
  } else if (walletStatus === 'wallet-locked') {
    return <div className="alert alert-danger">Wallet not unlocked</div>
  } else if (walletStatus === 'wallet-unapproved') {
    return (
      <div>
        <button
          className="btn btn-primary"
          onClick={() => {
            window.ethereum.enable()
          }}
        >
          Enable Wallet
        </button>
      </div>
    )
  } else if (walletStatus === 'wrong-network') {
    return <div className="alert alert-danger">{`Wrong network`}</div>
  }
  // console.log(walletStatus)
  return <div>{`Wallet Connected OK`}</div>
}

export default CryptoWallet
