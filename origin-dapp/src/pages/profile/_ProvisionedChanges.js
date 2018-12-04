import React, { Component } from 'react'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import Tooltip from 'components/tooltip'

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

  intl(field) {
    return this.props.intl.formatMessage(this.intlMessages[field])
  }

  checkmark(field) {
    return (
      <div>
        <img src="/images/checkmark-green.svg" alt="checkmark icon" />{' '}
        {this.intl(field)}
      </div>
    )
  }

  verifying(field) {
    return (
      <div className="text-left">
        <div>You are verifying:</div>
        <img src="/images/checkmark-green.svg" alt="checkmark icon" />
        {this.props.intl.formatMessage(this.intlMessages[field])}
        <br />
        <br />
        <img src="/images/eye-no.svg" alt="not-visible icon" />{' '}
        <strong>
          {this.props.intl.formatMessage(
            this.intlMessages.notVisibleOnBlockchain
          )}
        </strong>
      </div>
    )
  }

  render() {
    const { changes } = this.props,
      firstName = changes.find(c => c === 'firstName'),
      lastName = changes.find(c => c === 'lastName'),
      description = changes.find(c => c === 'description'),
      pic = changes.find(c => c === 'pic'),
      profile = changes.find(c => c.match(/name|desc|pic/i)),
      phone = changes.find(c => c === 'phone'),
      email = changes.find(c => c === 'email'),
      facebook = changes.find(c => c === 'facebook'),
      twitter = changes.find(c => c === 'twitter'),
      airbnb = changes.find(c => c === 'airbnb')

    return (
      <div className="d-flex change-icons justify-content-center">
        {!profile ? null : (
          <Tooltip
            placement="top"
            content={
              <div className="text-left">
                <div>{this.intl('youArePublishing')}</div>
                {firstName ? this.checkmark('firstName') : null}
                {lastName ? this.checkmark('lastName') : null}
                {description ? this.checkmark('description') : null}
                {pic ? this.checkmark('picture') : null}
                <img src="/images/eye-yes.svg" alt="visible icon" />
                <strong>{this.intl('visibleOnBlockchain')}</strong>
              </div>
            }
          >
            <div>
              <div className="image-container">
                <img
                  src="/images/publish-profile-icon.svg"
                  alt="profile icon"
                />
              </div>
              <div className="text-center">
                <FormattedMessage
                  id={'_ProvisionedChanges.profile'}
                  defaultMessage={'Profile'}
                />
              </div>
            </div>
          </Tooltip>
        )}
        {!phone ? null : (
          <Tooltip placement="top" content={this.verifying('phoneNumber')}>
            <div>
              <div className="image-container">
                <img src="/images/publish-phone-icon.svg" alt="phone icon" />
              </div>
              <div className="text-center">
                <FormattedMessage
                  id={'_ProvisionedChanges.phone'}
                  defaultMessage={'Phone'}
                />
              </div>
            </div>
          </Tooltip>
        )}
        {!email ? null : (
          <Tooltip placement="top" content={this.verifying('emailAddress')}>
            <div>
              <div className="image-container">
                <img src="/images/publish-email-icon.svg" alt="email icon" />
              </div>
              <div className="text-center">
                <FormattedMessage
                  id={'_ProvisionedChanges.email'}
                  defaultMessage={'Email'}
                />
              </div>
            </div>
          </Tooltip>
        )}
        {!facebook ? null : (
          <Tooltip placement="top" content={this.verifying('facebookAccount')}>
            <div>
              <div className="image-container">
                <img
                  src="/images/publish-facebook-icon.svg"
                  alt="Facebook icon"
                />
              </div>
              <div className="text-center">
                <FormattedMessage
                  id={'_ProvisionedChanges.facebook'}
                  defaultMessage={'Facebook'}
                />
              </div>
            </div>
          </Tooltip>
        )}
        {!twitter ? null : (
          <Tooltip placement="top" content={this.verifying('twitterAccount')}>
            <div>
              <div className="image-container">
                <img
                  src="/images/publish-twitter-icon.svg"
                  alt="Twitter icon"
                />
              </div>
              <div className="text-center">
                <FormattedMessage
                  id={'_ProvisionedChanges.twitter'}
                  defaultMessage={'Twitter'}
                />
              </div>
            </div>
          </Tooltip>
        )}
        {!airbnb ? null : (
          <Tooltip placement="top" content={this.verifying('airbnbAccount')}>
            <div>
              <div className="image-container">
                <img src="/images/publish-airbnb-icon.svg" alt="Airbnb icon" />
              </div>
              <div className="text-center">
                <FormattedMessage
                  id={'_ProvisionedChanges.airbnb'}
                  defaultMessage={'Airbnb'}
                />
              </div>
            </div>
          </Tooltip>
        )}
      </div>
    )
  }
}

export default injectIntl(ProvisionedChanges)
