import React, { Component } from 'react'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import $ from 'jquery'

class ProvisionedChanges extends Component {
  constructor(props) {
    super(props)

    this.intlMessages = defineMessages({
      youArePublishing: {
        id: '_ProvisionedChanges.youArePublishing',
        defaultMessage: 'You are publishing:'
      },
      firstName: {
        id: '_ProvisionedChanges.firstName',
        defaultMessage: 'First name'
      },
      lastName: {
        id: '_ProvisionedChanges.lastName',
        defaultMessage: 'Last Name'
      },
      description: {
        id: '_ProvisionedChanges.description',
        defaultMessage: 'Description'
      },
      picture: {
        id: '_ProvisionedChanges.picture',
        defaultMessage: 'Picture'
      },
      visibleOnBlockchain: {
        id: '_ProvisionedChanges.visibleOnBlockchain',
        defaultMessage: 'Visible on the blockchain'
      },
      notVisibleOnBlockchain: {
        id: '_ProvisionedChanges.notVisibleOnBlockchain',
        defaultMessage: 'Not visible on the blockchain'
      },
      phoneNumber: {
        id: '_ProvisionedChanges.phoneNumber',
        defaultMessage: 'Phone Number'
      },
      emailAddress: {
        id: '_ProvisionedChanges.emailAddress',
        defaultMessage: 'Email Address'
      },
      facebookAccount: {
        id: '_ProvisionedChanges.facebookAccount',
        defaultMessage: 'Facebook account'
      },
      twitterAccount: {
        id: '_ProvisionedChanges.twitterAccount',
        defaultMessage: 'Twitter account'
      },
      airbnbAccount: {
        id: '_ProvisionedChanges.airbnbAccount',
        defaultMessage: 'Airbnb account'
      }
    })
  }

  componentDidMount() {
    $('[data-toggle="tooltip"]').tooltip()
  }

  render() {
    const { changes } = this.props
    let profileTooltip = `<div class="text-left">${this.props.intl.formatMessage(this.intlMessages.youArePublishing)}<br />`

    if (changes.find(c => c === 'firstName')) {
      profileTooltip += `<img src="/images/checkmark-green.svg" alt="checkmark icon" /> ${this.props.intl.formatMessage(this.intlMessages.firstName)}<br />`
    }

    if (changes.find(c => c === 'lastName')) {
      profileTooltip += `<img src="/images/checkmark-green.svg" alt="checkmark icon" /> ${this.props.intl.formatMessage(this.intlMessages.lastName)}<br />`
    }

    if (changes.find(c => c === 'description')) {
      profileTooltip += `<img src="/images/checkmark-green.svg" alt="checkmark icon" /> ${this.props.intl.formatMessage(this.intlMessages.description)}<br />`
    }

    if (changes.find(c => c === 'pic')) {
      profileTooltip += `<img src="/images/checkmark-green.svg" alt="checkmark icon" /> ${this.props.intl.formatMessage(this.intlMessages.picture)}<br />`
    }

    profileTooltip += `<br /><img src="/images/eye-yes.svg" alt="visible icon" /> <strong>${this.props.intl.formatMessage(this.intlMessages.visibleOnBlockchain)}</strong></div>`

    return (
      <div className="d-flex change-icons justify-content-center">
        {changes.find(c => c.match(/name|desc|pic/i)) &&
          <div className="change-icon"
            data-toggle="tooltip"
            data-placement="top"
            data-html="true"
            title={profileTooltip}
          >
            <div className="image-container">
              <img src="/images/publish-profile-icon.svg" alt="profile icon" />
            </div>
            <div className="text-center">
              <FormattedMessage
                id={ '_ProvisionedChanges.profile' }
                defaultMessage={ 'Profile' }
              />
            </div>
          </div>
        }
        {changes.find(c => c === 'phone') &&
          <div className="change-icon"
            data-toggle="tooltip"
            data-placement="top"
            data-html="true"
            title={`
              <div class="text-left">
                You are verifying:<br />
                <img src="/images/checkmark-green.svg" alt="checkmark icon" /> ${this.props.intl.formatMessage(this.intlMessages.phoneNumber)}<br />
                <br />
                <img src="/images/eye-no.svg" alt="not-visible icon" /> <strong>${this.props.intl.formatMessage(this.intlMessages.notVisibleOnBlockchain)}</strong>
              </div>
            `}
          >
            <div className="image-container">
              <img src="/images/publish-phone-icon.svg" alt="phone icon" />
            </div>
            <div className="text-center">
              <FormattedMessage
                id={ '_ProvisionedChanges.phone' }
                defaultMessage={ 'Phone' }
              />
            </div>
          </div>
        }
        {changes.find(c => c === 'email') &&
          <div className="change-icon"
            data-toggle="tooltip"
            data-placement="top"
            data-html="true"
            title={`
              <div class="text-left">
                You are verifying:<br />
                <img src="/images/checkmark-green.svg" alt="checkmark icon" /> ${this.props.intl.formatMessage(this.intlMessages.emailAddress)}<br />
                <br />
                <img src="/images/eye-no.svg" alt="not-visible icon" /> <strong>${this.props.intl.formatMessage(this.intlMessages.notVisibleOnBlockchain)}</strong>
              </div>
            `}
          >
            <div className="image-container">
              <img src="/images/publish-email-icon.svg" alt="email icon" />
            </div>
            <div className="text-center">
              <FormattedMessage
                id={ '_ProvisionedChanges.email' }
                defaultMessage={ 'Email' }
              />
            </div>
          </div>
        }
        {changes.find(c => c === 'facebook') &&
          <div className="change-icon"
            data-toggle="tooltip"
            data-placement="top"
            data-html="true"
            title={`
              <div class="text-left">
                You are verifying:<br />
                <img src="/images/checkmark-green.svg" alt="checkmark icon" /> ${this.props.intl.formatMessage(this.intlMessages.facebookAccount)}<br />
                <br />
                <img src="/images/eye-no.svg" alt="not-visible icon" /> <strong>${this.props.intl.formatMessage(this.intlMessages.notVisibleOnBlockchain)}</strong>
              </div>
            `}
          >
            <div className="image-container">
              <img src="/images/publish-facebook-icon.svg" alt="Facebook icon" />
            </div>
            <div className="text-center">
              <FormattedMessage
                id={ '_ProvisionedChanges.facebook' }
                defaultMessage={ 'Facebook' }
              />
            </div>
          </div>
        }
        {changes.find(c => c === 'twitter') &&
          <div className="change-icon"
            data-toggle="tooltip"
            data-placement="top"
            data-html="true"
            title={`
              <div class="text-left">
                You are verifying:<br />
                <img src="/images/checkmark-green.svg" alt="checkmark icon" /> ${this.props.intl.formatMessage(this.intlMessages.twitterAccount)}<br />
                <br />
                <img src="/images/eye-no.svg" alt="not-visible icon" /> <strong>${this.props.intl.formatMessage(this.intlMessages.notVisibleOnBlockchain)}</strong>
              </div>
            `}
          >
            <div className="image-container">
              <img src="/images/publish-twitter-icon.svg" alt="Twitter icon" />
            </div>
            <div className="text-center">
              <FormattedMessage
                id={ '_ProvisionedChanges.twitter' }
                defaultMessage={ 'Twitter' }
              />
            </div>
          </div>
        }
        {changes.find(c => c === 'airbnb') &&
          <div className="change-icon"
            data-toggle="tooltip"
            data-placement="top"
            data-html="true"
            title={`
              <div class="text-left">
                You are verifying:<br />
                <img src="/images/checkmark-green.svg" alt="checkmark icon" /> ${this.props.intl.formatMessage(this.intlMessages.airbnbAccount)}<br />
                <br />
                <img src="/images/eye-yes.svg" alt="visible icon" /> <strong>${this.props.intl.formatMessage(this.intlMessages.visibleOnBlockchain)}</strong>
              </div>
            `}
          >
            <div className="image-container">
              <img src="/images/publish-airbnb-icon.svg" alt="Airbnb icon" />
            </div>
            <div className="text-center">
              <FormattedMessage
                id={ '_ProvisionedChanges.airbnb' }
                defaultMessage={ 'Airbnb' }
              />
            </div>
          </div>
        }
      </div>
    )
  }
}

export default injectIntl(ProvisionedChanges)
