import React, { Component } from 'react'
import { fbt } from 'fbt-runtime'

import Modal from 'components/Modal'

class MobileModal extends Component {
  render() {
    const isMobile = window.innerWidth < 767

    return (
      <Modal
        onClose={() => this.props.onClose()}
        closeBtn={true}
        className={isMobile ? 'is-mobile' : 'is-desktop'}
      >
        <div className="mobile-modal">
          <div className="screenshots">
            {!isMobile && <img src="/images/mobile/devices.png" />}
            {isMobile && <img src="/images/mobile/devices-layered.png" />}
          </div>
          <div className="description">
            <div className="blurb">
              <h5>
                <fbt desc="MobileModal.header">
                  Get the Origin Marketplace App
                </fbt>
              </h5>
              <div>
                <fbt desc="MobileModal.description">
                  You currently don&apos;t have a crypto wallet, which is
                  necessary to buy and sell on Origin.
                </fbt>
                {!isMobile && (
                  <fbt desc="MobileModal.scanQr">
                    Scan this QR code to download our marketplace app.
                  </fbt>
                )}
              </div>
            </div>
            {!isMobile && (
              <div className="qr">
                <img src="/images/mobile/qr.png" width="125" />
              </div>
            )}
          </div>
          {isMobile && (
            <div className="actions">
              <button
                className="btn btn-primary"
                onClick={() => {
                  window.location.href = 'https://originprotocol.com/mobile'
                }}
                children={fbt('Open App', 'MobileModal.openAppButton')}
              />
            </div>
          )}
        </div>
      </Modal>
    )
  }
}

export default MobileModal

require('react-styl')(`
  .mobile-modal
    margin-bottom: -1rem
    font-size: 16px
    a
      color: var(--white)
      text-decoration: underline
    h5
      font-family: Poppins
      font-size: 24px
      font-weight: 300
      line-height: 1.25
      color: white
    .screenshots
      margin-bottom: 2rem
      img
        margin-left: auto
        margin-right: auto
        width: 80%
    .description
      display: flex
      text-align: center
      background: #2e3f53
    .blurb
      font-size: 18px
      line-height: 1.33
    .qr
      margin-left: 10px
      padding: 5px
      border-radius: 5px
      background: white
    .actions
      flex-direction: column
      display: flex
      align-items: center
      label
        margin-top: 0.5rem
        color: var(--white)
        font-size: 12px
        input
          margin-right: 0.25rem
  .is-desktop
    .screenshots
      padding-top: 3rem
      margin-top: -3rem
      margin-right: -3rem
      margin-left: -3rem
      border-top-left-radius: 10px
      border-top-right-radius: 10px
      background: #111d28
      img
        width: 70%
    .description
      text-align: left;
    .close
      position: absolute
      right: 20px
      top: 20px
  .pl-modal-content
    max-width: 655px !important
  .pl-modal-content .actions .btn
    width: 100%
  .close
    color: #98a7b4
    text-shadow: none
`)
