import React from 'react'
import { fbt } from 'fbt-runtime'

const DownloadApp = () => {
  return (
    <div className="onboard-help origin-wallet">
      <div className="app-image mb-3">
        <img src="images/mobile/devices-layered.png" />
      </div>
      <h5>
        <fbt desc="onboard.Wallet.downloadApp">
          Download the Origin Marketplace App
        </fbt>
      </h5>
      <div className="description">
        <fbt desc="onboard.Wallet.unlockExperience">
          Unlock the full experience
        </fbt>
      </div>
      <div className="actions">
        <a href="https://originprotocol.com/mobile">
          <img src="images/app-store-button@2x.png" />
        </a>
        <a href="https://originprotocol.com/mobile">
          <img src="images/android-button@2x.png" />
        </a>
      </div>
    </div>
  )
}

export default DownloadApp

require('react-styl')(`
  .onboard-help.origin-wallet
    text-align: center
    .app-image
      img
        width: 140px
    .actions
      margin-top: 1.5rem
      display: flex
      a
        &:not(:last-of-type)
          margin-right: 1rem
        img
          width: 100%
`)
