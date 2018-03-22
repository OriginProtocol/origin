import React, { Component } from 'react'
import $ from 'jquery'
import moment from 'moment'
import Modal from './modal'
import VerifyWithCivic from './verify-with-civic'

class Profile extends Component {
  constructor(props) {
    super(props)

    this.handleToggle = this.handleToggle.bind(this)
    this.updateTimelapse = this.updateTimelapse.bind(this)
    this.state = {
      lastEdit: new Date(),
      modalsOpen: { profile: false, twitter: false },
      timelapse: 'a few seconds ago',
    }
  }

  componentDidMount() {
    $('.profile-wrapper [data-toggle="tooltip"]').tooltip()

    setTimeout(() => {
      this.ms = 1000
      this.interval = setInterval(this.updateTimelapse, this.ms)
    }, 4000)
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

  updateTimelapse() {
    const c = this
    const { lastEdit } = c.state
    const seconds = moment().diff(lastEdit, 'seconds')
    const second = 1
    const minute = 60 * second
    const hour = 60 * minute
    const day = 24 * hour
    const year = 365 * day
    let int = 0
    let timelapse = ''

    function conditionallyDecelerateInterval(measure) {
      if (c.ms / 1000 < measure) {
        clearInterval(c.interval)

        c.ms = measure * 1000
        c.interval = setInterval(c.updateTimelapse, c.ms)
      }
    }

    if (seconds < minute) {
      timelapse = `${seconds} seconds ago`
    } else if (seconds < hour) {
      int = Math.floor(seconds / minute)

      timelapse = `${int} minute${int > 1 ? 's' : ''} ago`

      conditionallyDecelerateInterval(minute)
    } else if (seconds < day) {
      int = Math.floor(seconds / hour)

      timelapse = `${int} hour${int > 1 ? 's' : ''} ago`

      conditionallyDecelerateInterval(hour)
    } else if (seconds < year) {
      int = Math.floor(seconds / day)

      timelapse = `over ${int} day${int > 1 ? 's' : ''} ago`

      clearInterval(c.interval)
    } else {
      int = Math.floor(seconds / year)

      timelapse = `over ${int} year${int > 1 ? 's' : ''} ago`

      clearInterval(c.interval)
    }

    c.setState({ timelapse })
  }

  componentWillUnmount() {
    $('.profile-wrapper [data-toggle="tooltip"]').tooltip('dispose')

    clearInterval(this.interval)
  }

  render() {
    const { lastEdit, timelapse } = this.state;

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
              <div className="verification">
                {lastEdit && <h4>Last Edited</h4>}
                {!!timelapse.length && <p>{timelapse}</p>}
                <h4>Status</h4>
                <p className="status">
                  <svg height="0.67rem" width="0.67rem">
                    <circle cx="0.335rem" cy="0.335rem" r="0.335rem" className="unpublished" />
                  </svg>Not published on Origin
                </p>
                <h4>Last published to Origin</h4>
                <p>March 15 @ 12:34pm</p>
                <button className="btn btn-primary" onClick={() => alert('To Do')}>Publish</button>
                <div className="info icon-container" data-toggle="tooltip" title="You can edit your profile any time but you will need to publish for others to be able to see it."></div>
              </div>
              <div className="wallet">
                <div className="image-container">
                  <img src="/images/identicon.png"
                    srcSet="/images/identicon@2x.png 2x, /images/identicon@3x.png 3x"
                    className="identicon"
                    alt="wallet icon" />
                </div>
                <p>ETH Address:</p>
                <p><strong>0x32Be343B94f860124dC4fEe278FDCBD38C102D88</strong></p>
                <hr />
                <div className="detail">
                  <p>Account Balance:</p>
                  <p>0 ETH</p>
                </div>
                <div className="detail">
                  <p>Transaction History:</p>
                  <p><a href="#">ETH</a> | <a href="#">Tokens</a></p>
                </div>
                <div>
                  <p><a href="#">View My Listings &gt;</a></p>
                </div>
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
