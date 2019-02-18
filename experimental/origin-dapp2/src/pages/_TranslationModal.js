import React, { Component } from 'react'
import { fbt } from 'fbt-runtime'

import Store from 'utils/store'

const store = Store('localStorage')

class TranslationModal extends Component {
  state = {
    hideModal: store.get('hide-translation-modal', false)
  }
  render() {
    if (this.state.hideModal || this.props.locale === 'en_US') {
      return null
    }
    return (
      <div className="translation-modal">
        <a
          href="#"
          className="translation-modal-close"
          onClick={e => this.onHide(e)}
          children="×"
        />
        <article className="translation-article">
          <fbt desc="modal.translationRequest">
            This page has been machine translated, see any errors?
          </fbt>
          <a
            className="btn btn-primary btn-rounded mt-3"
            href="https://goo.gl/forms/qooAg36lpN07GCVJ2"
            target="_blank"
            rel="noopener noreferrer"
          >
            <fbt desc="modal.translationRequestButton">Help Translate</fbt>
          </a>
        </article>
      </div>
    )
  }

  onHide(e) {
    e.preventDefault()
    store.set('hide-translation-modal', true)
    this.setState({ hideModal: true })
  }
}

export default TranslationModal

require('react-styl')(`
  .translation-modal
    position: fixed
    bottom: 1rem
    right: 1rem
    max-width: 18rem
  .translation-article
    padding: 1.5rem
    border-radius: var(--default-radius)
    font-size: 18px
    line-height: normal
    font-weight: normal
    text-align: center
    box-shadow: 1px 1px 20px 0 rgba(0, 0, 0, 0.25)
    background-color: var(--pale-grey)
  .translation-modal-close
    position: absolute
    top: 0
    right: 0
    padding: 0.75rem
    line-height: 0.5rem
    display: block
    font-weight: bold
    color: var(--dark)
`)
