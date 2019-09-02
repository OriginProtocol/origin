import React, { Component } from 'react'
import { fbt } from 'fbt-runtime'
import withIsMobile from 'hoc/withIsMobile'

import Modal from 'components/Modal'

class BrowserModal extends Component {
  render() {
    const isMobile = this.props.isMobile
    if (localStorage.ognNetwork === 'test') {
      return null
    }

    return (
      <Modal
        onClose={() => this.props.onClose()}
        closeBtn={true}
        classNameOuter="pl-modal-browse"
        className={isMobile ? 'is-mobile' : 'is-desktop'}
      >
        <div className="browse-modal">
          <div className="description">
            <div className="blurb">
              <h5 className="mb-4">
                <fbt desc="BrowseModal.header">
                  It seems that you are using Brave
                </fbt>
              </h5>
              <div>
                <fbt desc="BrowseModal.description">
                  To avoid problems with Origin Marketplace you should lower your shields
                </fbt>{' '}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    )
  }
}

export default withIsMobile(BrowserModal)

require('react-styl')(`
  .browse-modal
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
      text-align: center
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
  .pl-modal-browse
    .pl-modal-content.is-mobile
      position: relative
      .close
        position: absolute
        right: 15px
        top: 15px
      .browse-modal
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
