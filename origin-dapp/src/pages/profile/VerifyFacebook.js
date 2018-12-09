import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'

import Modal from 'components/modal'

import origin from '../../services/origin'

class VerifyFacebook extends Component {
  constructor() {
    super()
    this.state = {
      generalErrors: []
    }

    this.onCertify = this.onCertify.bind(this)
    this.onCancel = this.onCancel.bind(this)
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.open && this.props.open && !this.state.url) {
      origin.attestations.facebookAuthUrl().then(url => {
        this.setState({ url })
      })
    }
  }

  render() {
    return (
      <Modal
        isOpen={this.props.open}
        className="facebook attestation"
        handleToggle={this.props.handleToggle}
        tabIndex="-1"
      >
        <div className="image-container d-flex align-items-center">
          <img src="images/facebook-icon-dark.svg" role="presentation" />
        </div>
        <h2>
          <FormattedMessage
            id={'VerifyFacebook.verifyFBHeading'}
            defaultMessage={'Verify Your Facebook Account'}
          />
        </h2>
        {this.state.generalErrors.length > 0 && (
          <div className="general-error">
            {this.state.generalErrors.join(' ')}
          </div>
        )}
        <div className="explanation">
          <FormattedMessage
            id={'VerifyFacebook.accountNotPublic'}
            defaultMessage={
              'Other users will know that you have a verified Facebook account, but your account details will not be published on the blockchain. We will never post on your behalf.'
            }
          />
        </div>
        <div className="button-container d-md-flex flex-md-row justify-content-md-center pt-4">
          <button
            data-modal="facebook"
            className="btn btn-clear d-md-none col-5 col-sm-4"
            onClick={this.onCancel}
          >
            <FormattedMessage
              id={'VerifyFacebook.cancel'}
              defaultMessage={'Cancel'}
            />
          </button>
          <button
            type="submit"
            className="btn btn-clear col-5 col-sm-4"
            onClick={this.onCertify}
          >
            <FormattedMessage
              id={'VerifyFacebook.continue'}
              defaultMessage={'Continue'}
            />
          </button>
        </div>
        <div className="link-container d-none d-md-block">
          <a
            href="#"
            data-modal="facebook"
            onClick={this.onCancel}
          >
            <FormattedMessage
              id={'VerifyFacebook.cancel'}
              defaultMessage={'Cancel'}
            />
          </a>
        </div>
      </Modal>
    )
  }

  clearErrors() {
    this.setState({ generalErrors: [] })
  }

  onCancel(e) {
    e.preventDefault()
    this.props.handleToggle(e)
    this.clearErrors()
  }

  onCertify() {
    this.clearErrors()
    const fbWindow = window.open(this.state.url, '', 'width=650,height=500')

    const finish = async e => {
      const data = String(e.data)
      if (!data.match(/^origin-code:/)) {
        return
      }
      window.removeEventListener('message', finish, false)
      if (!fbWindow.closed) {
        fbWindow.close()
      }

      try {
        const facebookAttestation = await origin.attestations.facebookVerify({
          code: data.split(':')[1]
        })

        this.props.onSuccess(facebookAttestation)
      } catch (exception) {
        const errorsJson = JSON.parse(exception).errors

        // Service exceptions --> general error
        if (Array.isArray(errorsJson))
          this.setState({ generalErrors: errorsJson })
        // Form field error. Since no fields are displayed in the DAPP convert form field errors to general errors
        else
          this.setState({
            generalErrors: Object.keys(errorsJson)
              // Prepend the error with the field that is causing the error
              .map(field => `${field} : ${errorsJson[field].join(' ')}`)
          })
      }
    }

    window.addEventListener('message', finish, false)
  }
}

export default VerifyFacebook
