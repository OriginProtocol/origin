import React, { Component } from 'react'
import $ from 'jquery'
import Modal from './modal'
import VerifyWithCivic from './verify-with-civic'

class Profile extends Component {
  constructor(props) {
    super(props)

    this.handleToggle = this.handleToggle.bind(this)
    this.state = { modalsOpen: { profile: false, twitter: false } }
  }

  componentDidMount() {
    $('.profile-wrapper [data-toggle="tooltip"]').tooltip()
  }

  handleToggle(e) {
    const { modal } = e.currentTarget.dataset
    let obj = Object.assign({}, this.state.modalsOpen)

    for (let k in obj) {
      if (obj.hasOwnProperty(k)) {
        obj[k] = k === modal ? !obj[k] : false
      }
    }

    this.setState({ modalsOpen: obj })
  }

  componentWillUnmount() {
    $('.profile-wrapper [data-toggle="tooltip"]').tooltip('dispose')
  }

  render() {
    return (
      <div className="profile-wrapper">
        <header>
          <div className="container">
            <div className="row">
              <div className="col-12 col-lg-8">
                <div className="row">
                  <div className="col-4 col-md-3">
                  </div>
                  <div className="col-8 col-md-9 name">
                    <h1>Aure Gimon</h1>
                    <div className="icon-container">
                      <button className="edit-profile" data-modal="profile" onClick={this.handleToggle}><img src="/images/edit-icon.svg" alt="edit name" /></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
        <div className="container">
          <div className="row">
            <div className="col-12 col-lg-8">
              <div className="row">
                <div className="col-4 col-md-3">
                  <div className="avatar-container">
                    <img src="/images/avatar.svg" alt="avatar" />
                  </div>
                </div>
                <div className="col-8 col-md-9">
                  <p>This the account I use for lorem ipsum dolor sit amet consectetuer adsplicing nonummy pellentesque curabitur.</p>
                </div>
              </div>
              <div className="services row">
                <div className="col-12 col-sm-6">
                  <h2>Verify Yourself</h2>
                  <p>Lorem ipsum dolor sit amet consectetuer adsplicing nonummy pellentesque.</p>
                  <button className="service" data-modal="twitter" onClick={this.handleToggle}>
                    <div className="icon-container">
                      <img src="/images/twitter-icon.svg" alt="Twitter icon" />
                    </div>
                    <p>Twitter</p>
                    <div className="info icon-container" data-toggle="tooltip" title="To verify your profile, Origin will have you post a tweet to confirm account ownership"></div>
                  </button>
                  <button className="service" disabled>
                    <div className="icon-container">
                      <img src="/images/reddit-icon.svg" alt="Reddit icon" />
                    </div>
                    <p>Reddit</p>
                  </button>
                  <button className="service" disabled>
                    <div className="icon-container">
                      <img src="/images/facebook-icon.svg" alt="Facebook icon" />
                    </div>
                    <p>Facebook</p>
                  </button>
                  <button className="service" disabled>
                    <div className="icon-container">
                      <img src="/images/github-icon.svg" alt="Github icon" />
                    </div>
                    <p>GitHub</p>
                  </button>
                </div>
                <div className="col-12 col-sm-6">
                  <h2>3rd Party</h2>
                  <p>Lorem ipsum dolor sit amet consectetuer adsplicing nonummy pellentesque.</p>
                  <VerifyWithCivic />
                  <button className="service" disabled>
                    <div className="icon-container">
                      <img src="/images/uport-icon.svg" alt="Uport icon" />
                    </div>
                    <p>Uport</p>
                  </button>
                  <button className="service" disabled>
                    <div className="icon-container">
                      <img src="/images/origin-icon.svg" alt="Origin icon" />
                    </div>
                    <p>Origin Foundation</p>
                  </button>
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-4">
              <div className="wallet">
                <div className="image-container">
                  <img src="/images/identicon.png"
                    srcSet="/images/identicon@2x.png 2x, /images/identicon@3x.png 3x"
                    alt="wallet icon" />
                </div>
                <p>ETH Address:</p>
                <p><strong>0x32Be343B94f860124dC4fEe278FDCBD38C102D88</strong></p>
                <hr />
                <div>
                  <p>Account Balance:</p>
                  <p>0 ETH</p>
                </div>
                <div>
                  <p>Transaction History:</p>
                  <p><a href="#">ETH</a> | <a href="#">Tokens</a></p>
                </div>
              </div>
              <div className="verification">
                <div className="image-container">
                  <img src="/images/identity.svg" alt="identity icon" />
                </div>
                <p><strong>Verifying your profile</strong> allows other users to know that you are real and increases the changes of successful transactions.</p>
              </div>
            </div>
          </div>
        </div>
        <Modal isOpen={this.state.modalsOpen.profile} data-modal="profile" handleToggle={this.handleToggle}>
          <h2>Edit Profile</h2>
          <div className="container">
            <div className="row">
              <div className="col-6">
                <div className="image-container">
                  <div className="image-pair">
                    <div className="avatar-container">
                      <img src="/images/avatar.svg" alt="avatar" />
                    </div>
                    <button className="edit-profile" onClick={() => alert('To Do')}>
                      <img src="/images/camera-icon-circle.svg" alt="camera icon" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div className="form-group">
                  <label htmlFor="first-name">First Name</label>
                  <input type="text" id="first-name" className="form-control" placeholder="Select one" />
                </div>
                <div className="form-group">
                  <label htmlFor="last-name">Last Name</label>
                  <input type="text" id="last-name" className="form-control" placeholder="Select one" />
                </div>
              </div>
              <div className="col-12">
                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea rows="4" id="description" className="form-control" placeholder="Tell us a bit about yourself"></textarea>
                </div>
              </div>
              <div className="col-12">
                <div className="button-container">
                  <button className="btn btn-clear" data-modal="profile" onClick={this.handleToggle}>Cancel</button>
                  <button className="btn btn-clear" onClick={() => alert('To Do')}>Continue</button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
        <Modal isOpen={this.state.modalsOpen.twitter} data-modal="twitter" handleToggle={this.handleToggle}>
          <div className="image-container">
            <img src="/images/twitter-icon.svg" role="presentation"/>
          </div>
          <h2>Verify your Twitter Account</h2>
          <label htmlFor="twitter">Twitter Username</label>
          <input type="text" id="twitter" className="form-control" placeholder="Select one" />
          <div className="button-container">
            <button className="btn btn-clear" data-modal="twitter" onClick={this.handleToggle}>Cancel</button>
            <button className="btn btn-clear" onClick={() => alert('To Do')}>Continue</button>
          </div>
        </Modal>
      </div>
    )
  }
}

export default Profile
