import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import $ from 'jquery'
import Modal from './modal'
import Timelapse from './timelapse'

class Profile extends Component {
  constructor(props) {
    super(props)

    this.handleChange = this.handleChange.bind(this)
    this.handleIdentity = this.handleIdentity.bind(this)
    this.handlePublish = this.handlePublish.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleToggle = this.handleToggle.bind(this)
    this.handleUnload = this.handleUnload.bind(this)
    this.setProgress = this.setProgress.bind(this)
    this.state = {
      lastPublish: null,
      modalsOpen: {
        email: false,
        facebook: false,
        phone: false,
        profile: false,
        twitter: false,
        unload: false,
      },
      progress: {
        provisional: 0,
        published: 0,
      },
      strength: 0,
      form: {
        description: '',
        firstName: '',
        lastName: '',
      },
      provisional: {
        description: '',
        firstName: '',
        lastName: '',
        email: false,
        facebook: false,
        phone: false,
        twitter: false,
      },
      published: {
        description: '',
        firstName: '',
        lastName: '',
        email: false,
        facebook: false,
        phone: false,
        twitter: false,
      },
    }
  }

  handleUnload(e) {
    const message = 'If you exit without publishing, you\'ll lose all your changes.'
    const modalsOpen = Object.assign({}, this.state.modalsOpen, { unload: true })

    // modal will only render if user cancels unload using native dialog
    this.setState({ modalsOpen })

    e.returnValue = message

    return message
  }

  componentDidMount() {
    window.addEventListener('beforeunload', this.handleUnload)
  }

  componentDidUpdate() {
    const publishable = JSON.stringify(this.state.provisional) !== JSON.stringify(this.state.published)

    if (publishable) {
      $('.profile-wrapper [data-toggle="tooltip"]').tooltip()

      window.addEventListener('beforeunload', this.handleUnload)
    } else {
      window.removeEventListener('beforeunload', this.handleUnload)
    }
  }

  handleChange(e) {
    const { name, value } = e.target
    const form = Object.assign({}, this.state.form, { [name]: value })

    this.setState({ form })
  }

  handleIdentity(name) {
    const modalsOpen = Object.assign({}, this.state.modalsOpen, { [name]: false })
    let obj = Object.assign({}, this.state.provisional, { [name]: true })

    this.setState({ modalsOpen, provisional: obj })

    let { provisional, published } = this.state.progress

    this.setProgress({ provisional: provisional + ((100 - published) - provisional) / 2, published })
  }

  handlePublish(cb) {
    const { provisional, progress } = this.state

    this.setState({ lastPublish: new Date(), published: provisional })

    this.setProgress({ provisional: 0, published: progress.provisional + progress.published })

    typeof cb === 'function' && cb()
  }

  handleSubmit(e) {
    e.preventDefault()

    const modalsOpen = Object.assign({}, this.state.modalsOpen, { profile: false })
    let { form, progress, provisional } = this.state

    this.setState({ provisional: Object.assign({}, provisional, form), modalsOpen })
  }

  handleToggle(e) {
    const { modal } = e.currentTarget.dataset

    if (this.state.published[modal] || this.state.provisional[modal]) {
      return
    }

    let obj = Object.assign({}, this.state.modalsOpen)

    for (let k in obj) {
      if (obj.hasOwnProperty(k)) {
        obj[k] = k === modal ? !obj[k] : false
      }
    }

    this.setState({ modalsOpen: obj })
  }

  setProgress(progress) {
    const strength = progress.provisional + progress.published
    let i = this.state.strength

    const int = setInterval(() => {
      i += 1

      if (i > strength) {
        return clearInterval(int)
      }

      this.setState({ strength: i })
    }, 1000 / (strength - i))

    this.setState({ progress })
  }

  componentWillUnmount() {
    $('.profile-wrapper [data-toggle="tooltip"]').tooltip('dispose')

    window.removeEventListener('beforeunload', this.handleUnload)
  }

  render() {
    const { form, lastPublish, progress, provisional, published, strength } = this.state;
    const publishable = JSON.stringify(provisional) !== JSON.stringify(published)
    const fullName = [provisional.firstName, provisional.lastName].join(' ').trim()

    return (
      <div className="profile-wrapper">
        <div className="container">
          <div className="row">
            <div className="col-12 col-lg-8">
              <div className="row attributes">
                <div className="col-4 col-md-3">
                  <div className="avatar-container">
                    <img src="/images/avatar-unnamed.svg" alt="avatar" />
                  </div>
                </div>
                <div className="col-8 col-md-9">
                  <div className="name d-flex">
                    <h1>{fullName.length ? fullName : 'Unnamed User'}</h1>
                    <div className="icon-container">
                      <button className="edit-profile" data-modal="profile" onClick={this.handleToggle}><img src="/images/edit-icon.svg" alt="edit name" /></button>
                    </div>
                  </div>
                  <p>{provisional.description}</p>
                </div>
              </div>
              {publishable &&
                <div className="alert d-flex">
                  Your profile includes unpublished changes.
                  <div className="info icon-container" data-toggle="tooltip" title="Tell me more about what it means to publish and why I should do it."></div>
                </div>
              }
              <h2>Verify yourself on Origin</h2>
              <div className="services-container">
                <p className="credit">
                  Powered by <span className="logo">Origin<sup>ID</sup></span>
                </p>
                <p className="directive">Please connect your accounts below to strengthen your identity on Origin.</p>
                <div className="row no-gutters">
                  <div className="col-12 col-sm-6 col-md-4">
                    <button data-modal="phone" className={`service${published.phone ? ' published' : (provisional.phone ? ' verified' : '')}`} onClick={this.handleToggle}>
                      <span className="image-container d-flex text-center justify-content-center">
                        {<img src="/images/phone-icon-light.svg" alt="phone icon" />}
                      </span>
                      <p>Phone</p>
                    </button>
                  </div>
                  <div className="col-12 col-sm-6 col-md-4">
                    <button data-modal="email" className={`service${published.email ? ' published' : (provisional.email ? ' verified' : '')}`} onClick={this.handleToggle}>
                      <span className="image-container d-flex text-center justify-content-center">
                        {<img src="/images/email-icon.svg" alt="email icon" />}
                      </span>
                      <p>Email</p>
                    </button>
                  </div>
                  <div className="col-12 col-sm-6 col-md-4">
                    <button className="service disabled" disabled>
                      <span className="image-container d-flex text-center justify-content-center">
                        <img src="/images/address-icon.svg" alt="address icon" />
                      </span>
                      <span className="unavailable-bg"></span>
                      <span className="unavailable-message">Coming<br />Soon</span>
                      <p>Address</p>
                    </button>
                  </div>
                  <div className="col-12 col-sm-6 col-md-4">
                    <button data-modal="facebook" className={`service${published.facebook ? ' published' : (provisional.facebook ? ' verified' : '')}`} onClick={this.handleToggle}>
                      <span className="image-container d-flex text-center justify-content-center">
                        <img src="/images/facebook-icon.svg" alt="Facebook icon" />
                      </span>
                      <p>Facebook</p>
                    </button>
                  </div>
                  <div className="col-12 col-sm-6 col-md-4">
                    <button data-modal="twitter" className={`service${published.twitter ? ' published' : (provisional.twitter ? ' verified' : '')}`} onClick={this.handleToggle}>
                      <span className="image-container d-flex text-center justify-content-center">
                        <img src="/images/twitter-icon.svg" alt="Twitter icon" />
                      </span>
                      <p>Twitter</p>
                    </button>
                  </div>
                  <div className="col-12 col-sm-6 col-md-4">
                    <button className="service disabled" disabled>
                      <span className="image-container d-flex text-center justify-content-center">
                        <img src="/images/google-icon.svg" alt="Google icon" />
                      </span>
                      <span className="unavailable-bg"></span>
                      <span className="unavailable-message">Coming<br />Soon</span>
                      <p>Google</p>
                    </button>
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-between">
                <h2>Profile Strength</h2>
                <h2>{strength}%</h2>
              </div>
              <div className="progress">
                <div className="progress-bar" role="progressbar" style={{ width: `${progress.published}%` }} aria-valuenow={progress.published} aria-valuemin="0" aria-valuemax="100"></div>
                <div className="progress-bar provisional" role="progressbar" style={{ width: `${progress.provisional}%` }} aria-valuenow={progress.provisional} aria-valuemin="0" aria-valuemax="100"></div>
              </div>
              {publishable && <button className="publish btn btn-primary d-block" onClick={this.handlePublish}>Publish Now</button>}
              {lastPublish && <p className="timelapse text-center">Last Published <Timelapse reference={lastPublish} /></p>}
            </div>
            <div className="col-12 col-lg-4">
              {
                /* 
                  <div className="verification">
                    {lastEdit && <h4>Last Edited</h4>}
                    {lastEdit && <p><Timelapse reference={lastEdit} /></p>}
                    <h4>Status</h4>
                    <p className="status">
                      <svg height="0.67rem" width="0.67rem">
                        <circle cx="0.335rem" cy="0.335rem" r="0.335rem" className="unpublished" />
                      </svg>Not published on Origin
                    </p>
                    <h4>Last published to Origin</h4>
                    <p>March 15 @ 12:34pm</p>
                    <div className="info icon-container" data-toggle="tooltip" title="You can edit your profile any time but you will need to publish for others to be able to see it."></div>
                  </div>
                */
              }
              <div className="wallet">
                <div className="d-flex">
                  <div className="image-container">
                    <img src="/images/identicon.png"
                      srcSet="/images/identicon@2x.png 2x, /images/identicon@3x.png 3x"
                      className="identicon"
                      alt="wallet icon" />
                  </div>
                  <div className="eth">
                    <p>ETH Address:</p>
                    <p className="address"><strong>0x32Be343B94f860124dC4fEe278FDCBD38C102D88</strong></p>
                  </div>
                </div>
                <hr />
                <div className="detail d-flex">
                  <p>Account Balance:</p>
                  <p>0 ETH</p>
                </div>
                <div className="detail d-flex">
                  <p>Transaction History:</p>
                  <p><a href="#">ETH</a> | <a href="#">Tokens</a></p>
                </div>
              </div>
              <div className="guidance">
                <div className="image-container text-center">
                  <img src="/images/identity.svg" alt="identity icon" />
                </div>
                <p><strong>Verifying your profile</strong> allows other users to know that you are real and increases the chances of successful transactions on Origin.</p>
              </div>
            </div>
          </div>
        </div>
        <Modal isOpen={this.state.modalsOpen.profile} data-modal="profile" handleToggle={this.handleToggle}>
          <h2>Edit Profile</h2>
          <form ref={form => this.form = form} onSubmit={this.handleSubmit}>
            <div className="container">
              <div className="row">
                <div className="col-6">
                  <div className="image-container">
                    <div className="image-pair">
                      <div className="avatar-container">
                        <img src="/images/avatar-unnamed.svg" alt="avatar" />
                      </div>
                      <a className="edit-profile" onClick={() => alert('To Do')}>
                        <img src="/images/camera-icon-circle.svg" alt="camera icon" />
                      </a>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="form-group">
                    <label htmlFor="first-name">First Name</label>
                    <input type="text" id="first-name" name="firstName" className="form-control" value={form.firstName} onChange={this.handleChange} placeholder="Your First Name" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="last-name">Last Name</label>
                    <input type="text" id="last-name" name="lastName" className="form-control" value={form.lastName} onChange={this.handleChange} placeholder="Your Last Name" />
                  </div>
                </div>
                <div className="col-12">
                  <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea rows="4" id="description" name="description" className="form-control" value={form.description} onChange={this.handleChange} placeholder="Tell us a little something about yourself"></textarea>
                  </div>
                </div>
                <div className="col-12">
                  <div className="button-container">
                    <a className="btn btn-clear" data-modal="profile" onClick={this.handleToggle}>Cancel</a>
                    <button type="submit" className="btn btn-clear">Continue</button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </Modal>
        {
          /*
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
          */
        }
        <Modal isOpen={this.state.modalsOpen.email} data-modal="email" handleToggle={this.handleToggle}>
          <div className="image-container">
            <img src="/images/verified-icon.svg" role="presentation"/>
          </div>
          <h2>Miracle Function</h2>
          <p>You take some action to verify your identity with an email</p>
          <div className="button-container">
            <button className="btn btn-clear" data-modal="email" onClick={this.handleToggle}>Cancel</button>
            <button className="btn btn-clear" onClick={() => this.handleIdentity('email')}>Continue</button>
          </div>
        </Modal>
        <Modal isOpen={this.state.modalsOpen.facebook} data-modal="facebook" handleToggle={this.handleToggle}>
          <div className="image-container">
            <img src="/images/verified-icon.svg" role="presentation"/>
          </div>
          <h2>Miracle Function</h2>
          <p>You take some action to verify your identity with Facebook</p>
          <div className="button-container">
            <button className="btn btn-clear" data-modal="facebook" onClick={this.handleToggle}>Cancel</button>
            <button className="btn btn-clear" onClick={() => this.handleIdentity('facebook')}>Continue</button>
          </div>
        </Modal>
        <Modal isOpen={this.state.modalsOpen.phone} data-modal="phone" handleToggle={this.handleToggle}>
          <div className="image-container">
            <img src="/images/verified-icon.svg" role="presentation"/>
          </div>
          <h2>Miracle Function</h2>
          <p>You take some action to verify your identity with a phone</p>
          <div className="button-container">
            <button className="btn btn-clear" data-modal="phone" onClick={this.handleToggle}>Cancel</button>
            <button className="btn btn-clear" onClick={() => this.handleIdentity('phone')}>Continue</button>
          </div>
        </Modal>
        <Modal isOpen={this.state.modalsOpen.twitter} data-modal="twitter" handleToggle={this.handleToggle}>
          <div className="image-container">
            <img src="/images/verified-icon.svg" role="presentation"/>
          </div>
          <h2>Miracle Function</h2>
          <p>You take some action to verify your identity with Twitter</p>
          <div className="button-container">
            <button className="btn btn-clear" data-modal="twitter" onClick={this.handleToggle}>Cancel</button>
            <button className="btn btn-clear" onClick={() => this.handleIdentity('twitter')}>Continue</button>
          </div>
        </Modal>
        <Modal isOpen={this.state.modalsOpen.unload} data-modal="unload" handleToggle={this.handleToggle}>
          <div className="image-container">
            <img src="/images/public-icon.svg" role="presentation"/>
          </div>
          <h2>Wait! You haven’t published yet.</h2>
          <p>If you exit without publishing you’ll lose all your changes.</p>
          <p>Ready to go public? By updating your profile, you are publishing your information publicly and others will be able to see it on the blockchain and IPFS.</p>
          <div className="button-container">
            <button className="btn btn-clear" onClick={(e) => this.handlePublish(() => this.handleToggle(e))}>Publish Now</button>
          </div>
          <a data-modal="unload" onClick={this.handleToggle}>Not Right Now</a>
        </Modal>
      </div>
    )
  }
}

export default Profile
