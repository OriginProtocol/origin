import React, { Component } from 'react'
import { fbt } from 'fbt-runtime'

import Store from 'utils/store'

const store = Store('sessionStorage')

class TranslationModal extends Component {
  state = {
    hideModal: store.get('hide-translation-modal', false)
  }
  render() {
    // if we are viewing page in english or hideModal is truthy, do not render this modal
    if (this.state.hideModal || this.props.locale === 'en_US') {
      return null
    }
    return (
      // Return the JSX to display the tranlation modal
      <div className="translation-modal">
        {/* when clicking we call the onHide method */}
        <a className="translation-modal-close" onClick={e => this.onHide(e)} />
        <article className="translation-article">
          <fbt desc="modal.translationRequest">
            This page has been machine translated, see any errors?
          </fbt>
          <a
            className="btn btn-primary btn-lg active"
            href="https://goo.gl/forms/qooAg36lpN07GCVJ2"
            rol="button"
          >
            <fbt desc="modal.translationRequestButton">Help Translate</fbt>
          </a>
        </article>
      </div>
    )
  }

  // prevents a normal <a> navigation, stores bool in session storage, updates state to hide modal
  onHide(e) {
    e.preventDefault()
    store.set('hide-translation-modal', true)
    this.setState({ hideModal: true })
  }
}

export default TranslationModal

require('react-styl')(`
  .translation-modal
    position: fixed;
    z-index: 5000;
    bottom: 10px;
    right: 10px;
    max-width: 500px;
  .translation-article
    padding: 20px;
    border-radius: 4px;
    color: #212529;
    font-size: 18px;
    font-weight: 400;
    text-align: center;
    box-shadow: 1px 1px 20px 0 rgba(0, 0, 0, 0.25);
    cursor: pointer;
    background-color: #ebf0f3;
  .translation-modal-close
    position: fixed;
    width: 20px;
    height: 20px;
    z-index: 5000;
    right: 10px;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='25' height='30'><line x1='5' y1='10' x2='15' y2='20' stroke='%23bbb' stroke-width='2'/><line x1='15' y1='10' x2='5' y2='20' stroke='%23bbb' stroke-width='2'/></svg>");
    background-repeat: no-repeat;
    background-position: right top;
    background-color: #ebf0f3;
`)
