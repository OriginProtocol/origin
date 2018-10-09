import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'

import Modal from 'components/modal'

import origin from '../../services/origin'

class VerifyAirbnb extends Component {
  constructor() {
    super()
    this.state = {
      mode: 'input-airbnb-profile',
      airbnbProfile: '',
      confirmationCode: '',
      formErrors: {},
      generalErrors: []
    }

    this.onCancel = this.onCancel.bind(this)
  }

  render() {
    return (
      <Modal
        isOpen={this.props.open}
        data-modal="airbnb"
        className="attestation"
        handleToggle={this.props.handleToggle}
        tabIndex="-1"
      >
        <div className="image-container d-flex align-items-center">
          <img src="images/airbnb-icon-dark.svg" role="presentation" />
        </div>
        <h2>
          <FormattedMessage
            id={'VerifyAirbnb.averifyAirbnbAccount'}
            defaultMessage={'Verify your Airbnb account'}
          />
        </h2>
        {this.state.generalErrors.length > 0 && (
          <div className="general-error">
            {this.state.generalErrors.join(' ')}
          </div>
        )}
        {this.state.mode === 'input-airbnb-profile'
          ? this.renderInputAirbnbProfile()
          : this.renderShowGeneratedCode()}
      </Modal>
    )
  }

  renderInputAirbnbProfile() {
    const airbnbUserIdError = this.state.formErrors.airbnbUserId

    return (
      <form
        onSubmit={async event => {
          await this.catchPossibleErrors(async event => {
            event.preventDefault()
            this.clearErrors()

            const data = await origin.attestations.airbnbGenerateCode({
              wallet: this.props.wallet,
              airbnbUserId: this.getUserIdFromAirbnbProfile(
                this.state.airbnbProfile
              )
            })

            this.setState({
              mode: 'show-generated-code',
              confirmationCode: data.code
            })
          }, event)
        }}
      >
        <div className="form-group">
          <label htmlFor="airbnbProfile">
            {
              <FormattedMessage
                id={'VerifyAirbnb.enterAirbnbProfileUrl'}
                defaultMessage={'Enter Airbnb profile Url below'}
              />
            }
          </label>
          <div
            className={`form-control-wrap wide-control ${
              airbnbUserIdError ? 'error' : ''
            }`}
          >
            <input
              type="url"
              className="form-control"
              id="airbnbProfile"
              name="airbnbProfile"
              value={this.state.airbnbProfile}
              onChange={e =>
                this.setState({ airbnbProfile: e.currentTarget.value })
              }
              placeholder={this.props.intl.formatMessage({
                id: 'VerifyAirbnb.placeholderAirbnbProfileUrl',
                defaultMessage: 'https://www.airbnb.com/users/show/123'
              })}
              pattern="^https?://www\.airbnb\.com/users/show/\d*$"
              title={this.props.intl.formatMessage({
                id: 'VerifyAirbnb.airbnbProfileIncorrect',
                defaultMessage:
                  'Airbnb URL incorrect! Please paste exact URL of your Airbnb profile. Example: https://www.airbnb.com/users/show/123'
              })}
              required
            />
            {airbnbUserIdError && (
              <div className="error_message">{airbnbUserIdError.join(' ')}</div>
            )}
          </div>
          <div className="explanation">
            <FormattedMessage
              id={'VerifyAirbnb.airbnbProfilePublished'}
              defaultMessage={
                'Other users will know that you have a verified Airbnb profile.'
              }
            />
          </div>
        </div>
        <div className="button-container">
          <button type="submit" className="btn btn-clear">
            <FormattedMessage
              id={'VerifyAirbnb.continue'}
              defaultMessage={'Continue'}
            />
          </button>
        </div>
        <div className="link-container">
          <a href="#" data-modal="airbnb" onClick={this.onCancel}>
            <FormattedMessage
              id={'VerifyAirbnb.cancel'}
              defaultMessage={'Cancel'}
            />
          </a>
        </div>
      </form>
    )
  }

  renderShowGeneratedCode() {
    return (
      <form
        onSubmit={async event => {
          await this.catchPossibleErrors(async event => {
            event.preventDefault()
            this.clearErrors()

            const airbnbAttestation = await origin.attestations.airbnbVerify({
              wallet: this.props.wallet,
              airbnbUserId: this.getUserIdFromAirbnbProfile(
                this.state.airbnbProfile
              )
            })

            this.props.onSuccess(airbnbAttestation)
          }, event)
        }}
      >
        <div className="form-group">
          <label htmlFor="airbnbProfile">
            {
              <FormattedMessage
                id={'VerifyAirbnb.enterCodeIntoAirbnb'}
                defaultMessage={
                  'Go to Airbnb website, edit your profile and paste the following text into profile description.'
                }
              />
            }
          </label>
          <textarea
            className="form-control"
            id="airbnb-generated-code"
            readOnly="readOnly"
            value={
              this.state.confirmationCode === ''
                ? this.props.intl.formatMessage({
                  id: 'VerifyAirbnb.loadingConfirmationCode',
                  defaultMessage: 'Loading...'
                })
                : `Origin verification code: ${this.state.confirmationCode}`
            }
          />
          <div className="explanation">
            <FormattedMessage
              id={'VerifyAirbnb.continueToConfirmationCodeCheck'}
              defaultMessage={
                'Continue once the confirmation code is entered in your Airbnb profile.'
              }
            />
          </div>
        </div>
        <div className="button-container">
          <button type="submit" className="btn btn-clear">
            <FormattedMessage
              id={'VerifyAirbnb.continue'}
              defaultMessage={'Continue'}
            />
          </button>
        </div>
        <div className="link-container">
          <a href="#" data-modal="airbnb" onClick={this.onCancel}>
            <FormattedMessage
              id={'VerifyAirbnb.cancel'}
              defaultMessage={'Cancel'}
            />
          </a>
        </div>
      </form>
    )
  }

  onCancel(event) {
    event.preventDefault()
    this.clearErrors()

    // if user cancels when generated code is shown he might want to input different airbnb profile
    this.setState({ airbnbProfile: '', mode: 'input-airbnb-profile' })
    this.props.handleToggle(event)
  }

  clearErrors() {
    // clear errors
    this.setState({ formErrors: {} })
    this.setState({ generalErrors: [] })
  }

  async catchPossibleErrors(callback, event) {
    try {
      await callback(event)
    } catch (exception) {
      try {
        const errorsJson = JSON.parse(exception).errors

        if (Array.isArray(errorsJson))
          // Service exceptions
          this.setState({ generalErrors: errorsJson })
        // Form exception
        else this.setState({ formErrors: errorsJson })
      } catch (exception) {
        // Result wasn't a JSON. Could be a 404 or 500 or any other error
        this.setState({
          generalErrors: [
            this.props.intl.formatMessage({
              id: 'VerifyAirbnb.generalServiceError',
              defaultMessage:
                'Could not verify Airbnb. Please try again shortly.'
            })
          ]
        })
      }
    }
  }

  getUserIdFromAirbnbProfile(airbnbProfileUrl) {
    const airbnbRegex = /https?:\/\/www.airbnb.com\/users\/show\/(\d*)/g
    const match = airbnbRegex.exec(airbnbProfileUrl)

    if (!match.length) {
      // this should not happen since previous modal step's input validation checks for correct airbnb profile format
      return ''
    } else {
      return match[1]
    }
  }
}

export default VerifyAirbnb
