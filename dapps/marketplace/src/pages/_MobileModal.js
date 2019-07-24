import React, { Component } from 'react'
import { fbt } from 'fbt-runtime'
import copy from 'copy-to-clipboard'
import withIsMobile from 'hoc/withIsMobile'

import Modal from 'components/Modal'

class MobileModal extends Component {
  render() {
    const isMobile = this.props.isMobile
    if (localStorage.ognNetwork === 'test') {
      return null
    }

    return (
      <Modal
        onClose={() => this.props.onClose()}
        closeBtn={true}
        classNameOuter="pl-modal-mobile"
        className={isMobile ? 'is-mobile' : 'is-desktop'}
      >
        <div className="mobile-modal">
          <div className="screenshots">
            {!isMobile && <img src="images/mobile/devices.png" />}
            {isMobile && <img src="images/mobile/devices-layered.png" />}
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
                </fbt>{' '}
                {!isMobile && (
                  <fbt desc="MobileModal.scanQr">
                    Scan this QR code to download our marketplace app.
                  </fbt>
                )}
              </div>
            </div>
            {!isMobile && (
              <div className="qr">
                <img src="images/mobile/qr.svg" />
              </div>
            )}
          </div>
          {isMobile && (
            <div className="actions">
              <button
                className="btn btn-primary"
                onClick={() => {
                  const growthCode = localStorage.getItem('growth_invite_code')
                  if (growthCode) {
                    copy(`origin:growth_invite_code:${growthCode}`)
                  }
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

export default withIsMobile(MobileModal)

require('react-styl')(`
  .mobile-modal
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
  .pl-modal-mobile
    .pl-modal-content.is-mobile
      position: relative
      .close
        position: absolute
        right: 15px
        top: 15px
      .mobile-modal
        margin: 20px 15px 0
    .pl-modal-content.is-desktop
      max-width: 655px !important
      .screenshots
        padding-top: 3rem
        margin: -3rem -3rem 3rem -3rem
        border-top-left-radius: 10px
        border-top-right-radius: 10px
        background: #111d28
        img
          width: 70%
      .description
        align-items: center
        text-align: left
      .close
        position: absolute
        right: 20px
        top: 20px
      .qr
        padding: 20px
        img
          height: 110px
          width: 110px
      .actions .btn
        width: 100%
    .close
      color: #98a7b4
      text-shadow: none
`)
