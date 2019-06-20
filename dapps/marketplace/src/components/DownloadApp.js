import React from 'react'
import { fbt } from 'fbt-runtime'

const DownloadApp = () => (
  <div className="onboard-help origin-wallet">
    <div className="app-image mb-3">
      <img src="images/blue-coins.svg" />
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
      <a href="#">
        <img src="images/app-store-button.png" />
      </a>
      <a href="#">
        <img src="images/android-button.png" />
      </a>
    </div>
  </div>
)

export default DownloadApp

require('react-styl')(`
  .onboard-help.origin-wallet
    text-align: center
    .actions
      a
        display: inline-block
        padding: 0.5rem
        margin-top: 1.5rem
`)
