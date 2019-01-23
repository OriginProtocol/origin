import React, { Component } from 'react'

class Settings extends Component {
  render() {
    return (
      <div className="container settings">
        <h1>Settings</h1>
        <div class="row">
          <div class="col settings-box">
            <div class="form-group">
              <label for="language">Language</label>
              <div class="form-text form-text-muted">
                <small>Please make a selection from the list below.</small>
              </div>
              <select class="form-control form-control-lg">
                English
              </select>
            </div>
            <div class="form-group">
              <label for="notifications">Notifications</label>
              <div class="form-text form-text-muted">
                <small>Set your notifications settings below.</small>
              </div>
              <div class="form-check">
                <input class="form-check-input"
                    type="radio"
                    name="notifications"
                    id="notificationsOffRadio"
                    value="true"
                    checked />
                <label class="form-check-label" for="notifiationsOffRadio">
                  Off
                </label>
              </div>
              <div class="form-check">
                <input class="form-check-input"
                    type="radio"
                    name="notifications"
                    id="notificationsOnRadio"
                    value="true" />
                <label class="form-check-label" for="notificationsOnRadio">
                  All messages
                </label>
              </div>
            </div>
            <div class="form-group">
              <label for="Messaging">Messaging</label>
              <div class="form-text form-text-muted">
                <small>Enable/disable messaging by clicking the button below.</small>
              </div>
              <button class="btn btn-outline-danger">
                Disable
              </button>
            </div>
            <div class="form-group">
              <label for="language">Mobile Wallet</label>
              <div class="form-text form-text-muted">
                <small>Disconnect from your mobile wallet by clicking the button below.</small>
              </div>
              <button class="btn btn-outline-danger">
                Disconnect
              </button>
            </div>
          </div>
          <div class="col settings-box">
            <div class="form-group">
              <label for="indexing">Indexing Server</label>
              <div class="form-text form-text-muted">
                <small>Please select if you'd like to use an indexing server.</small>
              </div>
            </div>
            <div class="form-group">
              <label for="indexing">IPFS Gateway</label>
              <div class="form-text form-text-muted">
                <small>Please enter the URL below.</small>
              </div>
            </div>
            <div class="form-group">
              <label for="indexing">Ethereum Node</label>
              <div class="form-text form-text-muted">
                <small>Please enter the URL below.</small>
              </div>
            </div>
            <div class="form-group">
              <label for="indexing">Bridge Server</label>
              <div class="form-text form-text-muted">
                <small>Please enter the URL below.</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Settings

require('react-styl')(`
  .settings
    padding-top: 3rem

  .settings-box
    margin: 1rem
    padding: 2rem
    border: 1px solid var(--light)
    border-radius: var(--default-radius)

  .settings
    .form-text
      margin-top: -0.75rem
      margin-bottom: 0.5rem
      small
        font-size: 70%
    .form-group
      margin-bottom: 1.5rem
`)
