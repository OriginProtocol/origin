import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'

import Modal from 'components/modal'

import origin from '../../services/origin'

class VerifyTwitter extends Component {
  constructor() {
    super()
    this.state = {
      generalErrors: []
    }

    this.onCancel = this.onCancel.bind(this)
    this.onCertify = this.onCertify.bind(this)
  }

  async componentDidUpdate(prevProps) {
    await this.catchPossibleErrors(async () => {
      if (!prevProps.open && this.props.open && !this.state.url) {
        const url = await origin.attestations.twitterAuthUrl()
        this.setState({ url })
      }
    })
  }

  render() {
    return (
      <Modal
        isOpen={this.props.open}
        className="twitter attestation"
        handleToggle={this.props.handleToggle}
        tabIndex="-1"
      >
        <div className="image-container d-flex align-items-center">
          <img src="images/twitter-icon-dark.svg" role="presentation" />
        </div>
        <h2>
          <FormattedMessage
            id={'VerifyTwitter.verifyTwitterHeading'}
            defaultMessage={'Verify Your Twitter Account'}
          />
        </h2>
        {this.state.generalErrors.length > 0 && (
          <div className="general-error">
            {this.state.generalErrors.join(' ')}
          </div>
        )}
        <div className="explanation">
          <FormattedMessage
            id={'VerifyTwitter.twitterNotPublic'}
            defaultMessage={
              'Other users will know that you have a verified Twitter account and your username will be published on the blockchain. We will never tweet on your behalf.'
            }
          />
        </div>
        <div className="button-container d-md-flex flex-md-row justify-content-md-center pt-4">
          <button
            data-modal="twitter"
            className="btn btn-clear d-md-none col-5 col-sm-4"
            onClick={this.onCancel}
          >
            <FormattedMessage
              id={'VerifyTwitter.cancel'}
              defaultMessage={'Cancel'}
            />
          </button>
          <button
            type="submit"
            className="btn btn-clear col-5 col-sm-4"
            onClick={this.onCertify}
          >
            <FormattedMessage
              id={'VerifyTwitter.continue'}
              defaultMessage={'Continue'}
            />
          </button>
        </div>
        <div className="link-container d-none d-md-block">
          <a
            href="#"
            data-modal="twitter"
            onClick={this.onCancel}
          >
            <FormattedMessage
              id={'VerifyTwitter.cancel'}
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

  async catchPossibleErrors(callback, event) {
    try {
      if (event === undefined) await callback()
      else await callback(event)
    } catch (exception) {
      const errorsJson = JSON.parse(exception).errors

      if (Array.isArray(errorsJson))
        // Service exceptions
        this.setState({ generalErrors: errorsJson })
    }
  }

  onCancel(e) {
    e.preventDefault()
    this.props.handleToggle(e)
    this.clearErrors()
  }

  onCertify() {
    this.clearErrors()
    const twitterWindow = window.open(
      this.state.url,
      '',
      'width=650,height=500'
    )

    const finish = async event => {
      await this.catchPossibleErrors(async event => {
        const data = String(event.data)

        if (!data.match(/^origin-code:/)) {
          return
        }
        window.removeEventListener('message', finish, false)
        if (!twitterWindow.closed) {
          twitterWindow.close()
        }

        const twitterAttestation = await origin.attestations.twitterVerify({
          code: data.split(':')[1]
        })

        this.props.onSuccess(twitterAttestation)
      }, event)
    }

    window.addEventListener('message', finish, false)
  }
}

export default VerifyTwitter
