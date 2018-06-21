import React, { Component } from 'react'
import { FormattedMessage} from 'react-intl'
import Modal from 'components/modal'

import origin from '../../services/origin'

class VerifyAirbnb extends Component {
  constructor() {
    super()
    this.state = { mode: 'input-airbnb-profile', airbnbProfile: '', confirmationCode: ''}
  }

  render() {
    return (
      <Modal
        isOpen={this.props.open}
        data-modal="airbnb"
        className="identity"
        handleToggle={this.props.handleToggle}
      >
        <div className="image-container d-flex align-items-center">
          <img src="images/airbnb-icon-dark.svg" role="presentation" />
        </div>
        <h2>
          <FormattedMessage
            id={ 'VerifyAirbnb.averifyAirbnbAccount' }
            defaultMessage={ 'Verify your Airbnb account' }
          />
        </h2>

        <form
          onSubmit={async e => {
            e.preventDefault()
            if (this.state.mode === 'input-airbnb-profile') {
              this.setState({
                mode: 'show-generated-code', 
                confirmationCode: ''
              })

              origin.attestations.airbnbGenerateCode({
                wallet: this.props.wallet,
                airbnbUserId: this.getUserIdFromAirbnbProfile(this.state.airbnbProfile)
              }).then(data => {
                this.setState({confirmationCode: data.code});
              })
            } else if (this.state.mode === 'show-generated-code') {
              let airbnbAttestation = await origin.attestations.airbnbVerify({
                wallet: this.props.wallet,
                airbnbUserId: this.getUserIdFromAirbnbProfile(this.state.airbnbProfile)
              })

              this.props.onSuccess(airbnbAttestation)
            }
          }}
        >
          {this.state.mode === 'input-airbnb-profile'
            ? this.renderProfileLinkInputForm()
            : this.renderGeneratedCode()}
          <div className="button-container">
            <button type="submit" className="btn btn-clear">
              <FormattedMessage
                id={ 'VerifyAirbnb.continue' }
                defaultMessage={ 'Continue' }
              />
            </button>
          </div>
          <div className="link-container">
            <a
              href="#"
              data-modal="airbnb"
              onClick={e => {
                e.preventDefault()

                // if user cancels when generated code is shown he might want to input different airbnb profile
                if (this.state.mode === 'show-generated-code') {
                  this.setState({ airbnbProfile: '', mode: 'input-airbnb-profile'})
                }

                this.props.handleToggle(e)
              }}
            >
              <FormattedMessage
                id={ 'VerifyAirbnb.cancel' }
                defaultMessage={ 'Cancel' }
              />
            </a>
          </div>
        </form>
      </Modal>
    )
  }


  renderGeneratedCode() {
    return (
      <div className="form-group">
        <label htmlFor="airbnbProfile">
          { <FormattedMessage
            id={ 'VerifyAirbnb.enterCodeIntoAirbnb' }
            defaultMessage={ 'Go to Airbnb website, edit your profile and paste the following text into profile description.' }
          /> }
        </label>
        <input
          className="form-control"
          id="generated-code"
          readOnly="readOnly"
          // Making input wider, so that the whole verification code can be viewed without trimming.
          style={{maxWidth: '340px'}}
          value={this.state.confirmationCode == '' ? this.props.intl.formatMessage({ id: 'VerifyAirbnb.loadingConfirmationCode', defaultMessage: 'Loading...'}) : "Origin verification code: " + this.state.confirmationCode}
        />
        <div className="explanation">
          <FormattedMessage
            id={ 'VerifyAirbnb.continueToConfirmationCodeCheck' }
            defaultMessage={ 'Continue once the confirmation code is entered in your Airbnb profile.' }
          />
        </div>
      </div>
    )
  }

  renderProfileLinkInputForm() {
    return (
      <div className="form-group">
        <label htmlFor="airbnbProfile">
          { <FormattedMessage
            id={ 'VerifyAirbnb.enterAirbnbProfileUrl' }
            defaultMessage={ 'Enter Airbnb profile Url below' }
          /> }
        </label>
        <input
          type="url"
          className="form-control"
          id="airbnbProfile"
          name="airbnbProfile"
          style={{maxWidth: `400px`}} // Making wider input, so that the whole profile placeholder can be viewed without trimming
          value={this.state.airbnbProfile}
          onChange={e =>
            this.setState({ airbnbProfile: e.currentTarget.value })
          }
          placeholder={this.props.intl.formatMessage({ id: 'VerifyAirbnb.placeholderAirbnbProfileUrl', defaultMessage: 'https://www.airbnb.com/users/show/123'})}
          pattern="^https?://www\.airbnb\.com/users/show/\d*$"
          title={this.props.intl.formatMessage({ id: 'VerifyAirbnb.airbnbProfileIncorrect', defaultMessage: 'Airbnb URL incorrect! Please paste exact URL of your Airbnb profile. Example: https://www.airbnb.com/users/show/123'})}
          required
        />
        <div className="explanation">
          <FormattedMessage
            id={ 'VerifyAirbnb.airbnbProfileNotPublished' }
            defaultMessage={ 'Other users will know that you have a verified Airbnb profile. The link to your actual profile will not be published on the blockchain.' }
          />
        </div>
      </div>
    )
  }

  getUserIdFromAirbnbProfile(airbnbProfileUrl){
    var airbnbRegex = /https?\:\/\/www.airbnb.com\/users\/show\/(\d*)/g;
    var match = airbnbRegex.exec(airbnbProfileUrl);

    if (match.length == 0){
      // this should not happen since previous modal step's input validation checks for correct airbnb profile format
      return "";
    } else {
      return match[1];
    }
  }
}


export default VerifyAirbnb
