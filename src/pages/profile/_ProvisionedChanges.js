import React, { Component } from 'react'
import $ from 'jquery'

class ProvisionedChanges extends Component {
  componentDidMount() {
    $('[data-toggle="tooltip"]').tooltip()
  }

  render() {
    const { changes } = this.props
    let profileTooltip = `<div class="text-left">You are publishing:<br />`

    if (changes.find(c => c === 'firstName')) {
      profileTooltip += `<img src="/images/checkmark-green.svg" alt="checkmark icon" /> First name<br />`
    }

    if (changes.find(c => c === 'lastName')) {
      profileTooltip += `<img src="/images/checkmark-green.svg" alt="checkmark icon" /> Last name<br />`
    }

    if (changes.find(c => c === 'description')) {
      profileTooltip += `<img src="/images/checkmark-green.svg" alt="checkmark icon" /> Description<br />`
    }

    if (changes.find(c => c === 'pic')) {
      profileTooltip += `<img src="/images/checkmark-green.svg" alt="checkmark icon" /> Picture<br />`
    }

    profileTooltip += `<br /><img src="/images/eye-yes.svg" alt="visible icon" /> <strong>Visible on the blockchain</strong></div>`

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
            <div className="text-center">Profile</div>
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
                <img src="/images/checkmark-green.svg" alt="checkmark icon" /> Phone number<br />
                <br />
                <img src="/images/eye-no.svg" alt="not-visible icon" /> <strong>Not visible on the blockchain</strong>
              </div>
            `}
          >
            <div className="image-container">
              <img src="/images/publish-phone-icon.svg" alt="phone icon" />
            </div>
            <div className="text-center">Phone</div>
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
                <img src="/images/checkmark-green.svg" alt="checkmark icon" /> Email address<br />
                <br />
                <img src="/images/eye-no.svg" alt="not-visible icon" /> <strong>Not visible on the blockchain</strong>
              </div>
            `}
          >
            <div className="image-container">
              <img src="/images/publish-email-icon.svg" alt="email icon" />
            </div>
            <div className="text-center">Email</div>
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
                <img src="/images/checkmark-green.svg" alt="checkmark icon" /> Facebook account<br />
                <br />
                <img src="/images/eye-no.svg" alt="not-visible icon" /> <strong>Not visible on the blockchain</strong>
              </div>
            `}
          >
            <div className="image-container">
              <img src="/images/publish-facebook-icon.svg" alt="Facebook icon" />
            </div>
            <div className="text-center">Facebook</div>
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
                <img src="/images/checkmark-green.svg" alt="checkmark icon" /> Twitter account<br />
                <br />
                <img src="/images/eye-no.svg" alt="not-visible icon" /> <strong>Not visible on the blockchain</strong>
              </div>
            `}
          >
            <div className="image-container">
              <img src="/images/publish-twitter-icon.svg" alt="Twitter icon" />
            </div>
            <div className="text-center">Twitter</div>
          </div>
        }
      </div>
    )
  }
}

export default ProvisionedChanges
