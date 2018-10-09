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
        data-modal="twitter"
        className="attestation"
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
              'Other users will know that you have a verified Twitter account. Your username will not be published on the blockchain. We will never tweet on your behalf.'
            }
          />
        </div>
        <div className="button-container">
          <button
            type="submit"
            className="btn btn-clear"
            onClick={() => this.onCertify()}
          >
            <FormattedMessage
              id={'VerifyTwitter.continue'}
              defaultMessage={'Continue'}
            />
          </button>
        </div>
        <div className="link-container">
          <a
            href="#"
            data-modal="twitter"
            onClick={event => {
              event.preventDefault()
              this.props.handleToggle(event)
              this.clearErrors()
            }}
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
