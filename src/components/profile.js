import React, { Component } from 'react'
import $ from 'jquery'
import Modal from './modal'
import Timelapse from './timelapse'
import UserCard from './user-card'

// sample list of available countries for phone number prefix
const countryOptions = [
  {
    code: 'us',
    name: 'United States',
    prefix: '1',
  },
  {
    code: 'cn',
    name: 'China',
    prefix: '86',
  },
  {
    code: 'jp',
    name: 'Japan',
    prefix: '81',
  },
  {
    code: 'de',
    name: 'Germany',
    prefix: '49',
  },
  {
    code: 'fr',
    name: 'France',
    prefix: '33',
  },
  {
    code: 'ru',
    name: 'Russia',
    prefix: '7',
  },
  {
    code: 'br',
    name: 'Brazil',
    prefix: '55',
  },
  {
    code: 'it',
    name: 'Italy',
    prefix: '39',
  },
  {
    code: 'gb',
    name: 'United Kingdom',
    prefix: '44',
  },
  {
    code: 'kr',
    name: 'South Korea',
    prefix: '82',
  },
]

class Profile extends Component {
  constructor(props) {
    super(props)

    this.handleChange = this.handleChange.bind(this)
    this.handleIdentity = this.handleIdentity.bind(this)
    this.handlePublish = this.handlePublish.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleToggle = this.handleToggle.bind(this)
    this.handleUnload = this.handleUnload.bind(this)
    this.hasUnpublishedChanges = this.hasUnpublishedChanges.bind(this)
    this.setProgress = this.setProgress.bind(this)
    /*
      Three-ish Profile States

      published: Published to blockchain
      provisional: Ready to publish to blockchain
      userForm: Values for controlled components
      * TODO: retrieve current profile from blockchain
      * TODO: cache provisional state with local storage (if approved by Stan/Matt/Josh)
    */
    this.state = {
      lastPublish: null,
      // control state of email form, but do not nest in userForm
      emailForm: {
        address: '',
        verificationCode: '',
        verificationRequested: false,
      },
      modalsOpen: {
        email: false,
        facebook: false,
        phone: false,
        profile: false,
        twitter: false,
        unload: false,
      },
      // control state of phone form, but do not nest in userForm
      phoneForm: {
        countryCode: 'us',
        number: '',
        verificationCode: '',
        verificationRequested: false,
      },
      // percentage widths for two progress bars
      progress: {
        provisional: 0,
        published: 0,
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
      // sum of two progress bar widths
      strength: 0,
      // control state of profile attributes and computed email/phone values
      userForm: {
        description: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
      },
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { phoneForm, userForm } = this.state

    // prompt user if tab/window is closing before changes have been published
    if (this.hasUnpublishedChanges()) {
      $('.profile-wrapper [data-toggle="tooltip"]').tooltip()

      window.addEventListener('beforeunload', this.handleUnload)
    } else {
      window.removeEventListener('beforeunload', this.handleUnload)
    }

    // concatenate phone number segments when country code or number is changed
    if ((prevState.phoneForm.countryCode !== phoneForm.countryCode) || prevState.phoneForm.number !== phoneForm.number) {
      const obj = Object.assign({}, userForm, {
        phone: `${countryOptions.find(c => c.code === phoneForm.countryCode).prefix}${phoneForm.number}`,
      })

      this.setState({ userForm: obj })
    }
  }

  // update state for controlled names and description components
  handleChange(e) {
    const { name, value } = e.target
    const userForm = Object.assign({}, this.state.userForm, { [name]: value })

    this.setState({ userForm })
  }

  // initiate validation sequence for the named identity service
  handleIdentity(name) {
    if (name === 'email' && !this.state.emailForm.verificationRequested) {
      return this.setState({ emailForm: Object.assign({}, this.state.emailForm, { verificationRequested: true }) })
    }

    if (name === 'phone' && !this.state.phoneForm.verificationRequested) {
      return this.setState({ phoneForm: Object.assign({}, this.state.phoneForm, { verificationRequested: true }) })
    }

    const modalsOpen = Object.assign({}, this.state.modalsOpen, { [name]: false })
    // TODO: use token or hashed/salted value instead of boolean to indicate verification
    let obj = Object.assign({}, this.state.provisional, { [name]: true })

    this.setState({ modalsOpen, provisional: obj })

    let { provisional, published } = this.state.progress

    this.setProgress({ provisional: provisional + ((100 - published) - provisional) / 2, published })
  }

  // copy provisional state to published and run optional callback
  handlePublish(cb) {
    const { provisional, progress } = this.state

    this.setState({ lastPublish: new Date(), published: provisional })

    this.setProgress({ provisional: 0, published: progress.provisional + progress.published })

    typeof cb === 'function' && cb()
  }

  // copy userForm changes to provisional state and close profile modal
  handleSubmit(e) {
    e.preventDefault()

    const modalsOpen = Object.assign({}, this.state.modalsOpen, { profile: false })
    let { provisional, userForm } = this.state

    this.setState({ provisional: Object.assign({}, provisional, userForm), modalsOpen })
  }

  // conditionally close modal identified by data attribute
  handleToggle(e) {
    const { modal } = e.currentTarget.dataset

    /*
      We currently ignore the click if the identity has been verified.
      TODO: Allow provisional validations to be reviewed and/or
      undone individually before publishing to the blockchain.
    */
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

  // warning message will be ignored by the native dialog in Chrome and Firefox
  handleUnload(e) {
    const message = 'If you exit without publishing, you\'ll lose all your changes.'
    const modalsOpen = Object.assign({}, this.state.modalsOpen, { unload: true })

    // modal will only render if user cancels unload using native dialog
    this.setState({ modalsOpen })

    e.returnValue = message

    return message
  }

  // TODO: consider using a more robust object comparison strategy
  hasUnpublishedChanges() {
    const { provisional, published } = this.state

    return JSON.stringify(provisional) !== JSON.stringify(published)
  }

  // cause profile strength counter to increment (gradually) and progress bar to widen
  setProgress(progress) {
    const strength = progress.provisional + progress.published
    let i = this.state.strength

    // lots of state changes here, there may be a better way to increment counter
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
    const { emailForm, lastPublish, modalsOpen, phoneForm, progress, provisional, published, strength, userForm } = this.state
    const publishable = this.hasUnpublishedChanges()
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
              <h2>Verify yourself on Origin</h2>
              <div className="services-container">
                <div className="credit">Powered by <span className="logo">Origin<sup>ID</sup></span></div>
                <div className="directive">Please connect your accounts below to strengthen your identity on Origin.</div>
                <div className="row no-gutters">
                  <div className="col-12 col-sm-6 col-md-4">
                    <button data-modal="phone" className={`service d-flex${published.phone ? ' published' : (provisional.phone ? ' verified' : '')}`} onClick={this.handleToggle}>
                      <span className="image-container d-flex align-items-center justify-content-center">
                        {<img src="/images/phone-icon-light.svg" alt="phone icon" />}
                      </span>
                      <span className="service-name">Phone</span>
                    </button>
                  </div>
                  <div className="col-12 col-sm-6 col-md-4">
                    <button data-modal="email" className={`service d-flex${published.email ? ' published' : (provisional.email ? ' verified' : '')}`} onClick={this.handleToggle}>
                      <span className="image-container d-flex align-items-center justify-content-center">
                        {<img src="/images/email-icon-light.svg" alt="email icon" />}
                      </span>
                      <span className="service-name">Email</span>
                    </button>
                  </div>
                  <div className="col-12 col-sm-6 col-md-4">
                    <button className="service d-flex disabled" disabled>
                      <span className="image-container d-flex align-items-center justify-content-center">
                        <img src="/images/address-icon.svg" alt="address icon" />
                      </span>
                      <span className="unavailable-bg"></span>
                      <span className="unavailable-message">Coming<br />Soon</span>
                      <span className="service-name">Address</span>
                    </button>
                  </div>
                  <div className="col-12 col-sm-6 col-md-4">
                    <button data-modal="facebook" className={`service d-flex${published.facebook ? ' published' : (provisional.facebook ? ' verified' : '')}`} onClick={this.handleToggle}>
                      <span className="image-container d-flex align-items-center justify-content-center">
                        <img src="/images/facebook-icon-light.svg" alt="Facebook icon" />
                      </span>
                      <span className="service-name">Facebook</span>
                    </button>
                  </div>
                  <div className="col-12 col-sm-6 col-md-4">
                    <button data-modal="twitter" className={`service d-flex${published.twitter ? ' published' : (provisional.twitter ? ' verified' : '')}`} onClick={this.handleToggle}>
                      <span className="image-container d-flex align-items-center justify-content-center">
                        <img src="/images/twitter-icon-light.svg" alt="Twitter icon" />
                      </span>
                      <span className="service-name">Twitter</span>
                    </button>
                  </div>
                  <div className="col-12 col-sm-6 col-md-4">
                    <button className="service d-flex disabled" disabled>
                      <span className="image-container d-flex align-items-center justify-content-center">
                        <img src="/images/google-icon.svg" alt="Google icon" />
                      </span>
                      <span className="unavailable-bg"></span>
                      <span className="unavailable-message">Coming<br />Soon</span>
                      <span className="service-name">Google</span>
                    </button>
                  </div>
                  <div className="col-12">
                    <div className="d-flex justify-content-between">
                      <h3>Profile Strength</h3>
                      <h3>{strength}%</h3>
                    </div>
                    <div className="progress">
                      <div className="progress-bar" role="progressbar" style={{ width: `${progress.published}%` }} aria-valuenow={progress.published} aria-valuemin="0" aria-valuemax="100"></div>
                      <div className="progress-bar provisional" role="progressbar" style={{ width: `${progress.provisional}%` }} aria-valuenow={progress.provisional} aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                    {!publishable &&
                      <button className="publish btn btn-sm btn-primary d-block" disabled>Publish Now</button>
                    }
                    {publishable &&
                      <button className="publish btn btn-sm btn-primary d-block" onClick={this.handlePublish}>Publish Now</button>
                    }
                    <div className="published-status text-center">
                      <span>Status:</span>
                      {!lastPublish && <span className="not-published">Not Published</span>}
                      {lastPublish && <span>Last published <Timelapse reactive={true} reference={lastPublish} /></span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-4">
              <div className="wallet">
                <div className="d-flex">
                  <div className="image-container">
                    <img src="/images/identicon.png"
                      srcSet="/images/identicon@2x.png 2x, /images/identicon@3x.png 3x"
                      className="identicon"
                      alt="wallet icon" />
                  </div>
                  <div className="eth d-flex flex-column justify-content-between">
                    <div>ETH Address:</div>
                    <div>0x32Be343B94f860124dC4fEe278FDCBD38C102D88</div>
                  </div>
                </div>
                <hr className="dark sm" />
                <div className="detail d-flex">
                  <div>Account Balance:</div>
                  <div>0 ETH</div>
                </div>
                <div className="detail d-flex">
                  <div>Transaction History:</div>
                  <div><a href="#">ETH</a> | <a href="#">Tokens</a></div>
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
        <Modal isOpen={modalsOpen.profile} data-modal="profile" handleToggle={this.handleToggle}>
          <h2>Edit Profile</h2>
          <form onSubmit={this.handleSubmit}>
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
                    <input type="text" id="first-name" name="firstName" className="form-control" value={userForm.firstName} onChange={this.handleChange} placeholder="Your First Name" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="last-name">Last Name</label>
                    <input type="text" id="last-name" name="lastName" className="form-control" value={userForm.lastName} onChange={this.handleChange} placeholder="Your Last Name" />
                  </div>
                </div>
                <div className="col-12">
                  <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea rows="4" id="description" name="description" className="form-control" value={userForm.description} onChange={this.handleChange} placeholder="Tell us a little something about yourself"></textarea>
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
        <Modal isOpen={modalsOpen.email} data-modal="email" className="identity" handleToggle={this.handleToggle}>
          <div className="image-container d-flex align-items-center">
            <img src="/images/email-icon-dark.svg" role="presentation"/>
          </div>
          <form onSubmit={(e) => {
            e.preventDefault()

            this.handleIdentity('email')
          }}>
            <h2>Verify Your Email Address</h2>
            {!emailForm.verificationRequested &&
              <div className="form-group">
                <label htmlFor="email">Enter your email below</label>
                <input type="email" className="form-control" id="email" name="email" value={emailForm.address} onChange={(e) => {
                  this.setState({ emailForm: Object.assign({}, emailForm, { address: e.target.value })})
                }} placeholder="Valid email address" required />
              </div>
            }
            {emailForm.verificationRequested &&
              <div className="form-group">
                <label htmlFor="emailVerificationCode">Enter the code we sent you below</label>
                <input className="form-control" id="emailVerificationCode" name="phone-verification-code" value={emailForm.verificationCode} onChange={(e) => {
                  this.setState({ emailForm: Object.assign({}, emailForm, { verificationCode: e.target.value })})
                }} placeholder="Verification code" pattern="[a-zA-Z0-9]{6}" title="6-Character Verification Code" required />
              </div>
            }
            <div className="button-container">
              <a className="btn btn-clear" data-modal="email" onClick={this.handleToggle}>Cancel</a>
              <button type="submit" className="btn btn-clear">Continue</button>
            </div>
          </form>
        </Modal>
        <Modal isOpen={modalsOpen.facebook} data-modal="facebook" className="identity" handleToggle={this.handleToggle}>
          <div className="image-container d-flex align-items-center">
            <img src="/images/facebook-icon-dark.svg" role="presentation"/>
          </div>
          <h2>Verify Your Facebook Account</h2>
          <pre style={{ color: 'white', fontSize: '1.5rem' }}>To Do &#10003;</pre>
          <form onSubmit={(e) => {
            e.preventDefault()

            this.handleIdentity('facebook')
          }}>
            <div className="button-container">
              <a className="btn btn-clear" data-modal="facebook" onClick={this.handleToggle}>Cancel</a>
              <button type="submit" className="btn btn-clear">Continue</button>
            </div>
          </form>
        </Modal>
        <Modal isOpen={modalsOpen.phone} data-modal="phone" className="identity" handleToggle={this.handleToggle}>
          <div className="image-container d-flex align-items-center">
            <img src="/images/phone-icon-dark.svg" role="presentation"/>
          </div>
          <form onSubmit={(e) => {
            e.preventDefault()

            this.handleIdentity('phone')
          }}>
            <h2>Verify Your Phone Number</h2>
            {!phoneForm.verificationRequested &&
              <div className="form-group">
                <label htmlFor="phoneNumber">Enter your phone number below</label>
                <div className="d-flex">
                  <div className="country-code dropdown">
                    <div className="dropdown-toggle" role="button" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                      <img src={`/images/flags/${phoneForm.countryCode}.svg`} role="presentation" alt={`${phoneForm.countryCode.toUpperCase()} flag`} />
                    </div>
                    <div className="dropdown-menu" aria-labelledby="dropdownMenuLink">
                      {countryOptions.map(c => (
                        <div key={c.prefix} className="dropdown-item d-flex" onClick={() => {
                          this.setState({ phoneForm: Object.assign({}, phoneForm, { countryCode: c.code }) })
                        }}>
                          <div><img src={`/images/flags/${c.code}.svg`} role="presentation" alt={`${c.code.toUpperCase()} flag`} /></div>
                          <div>{c.name}</div>
                          <div>+{c.prefix}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <input type="phone" className="form-control" id="phoneNumber" name="phone-number" value={phoneForm.number} onChange={(e) => {
                    this.setState({ phoneForm: Object.assign({}, phoneForm, { number: e.target.value })})
                  }} placeholder="Area code and phone number" pattern="\d+" title="Numbers only" required />
                </div>
              </div>
            }
            {phoneForm.verificationRequested &&
              <div className="form-group">
                <label htmlFor="phoneVerificationCode">Enter the code we sent you below</label>
                <input className="form-control" id="phoneVerificationCode" name="phone-verification-code" value={phoneForm.verificationCode} onChange={(e) => {
                  this.setState({ phoneForm: Object.assign({}, phoneForm, { verificationCode: e.target.value })})
                }} placeholder="Verification code" pattern="[a-zA-Z0-9]{6}" title="6-Character Verification Code" required />
              </div>
            }
            <div className="button-container">
              <a className="btn btn-clear" data-modal="phone" onClick={this.handleToggle}>Cancel</a>
              <button type="submit" className="btn btn-clear">Continue</button>
            </div>
          </form>
        </Modal>
        <Modal isOpen={modalsOpen.twitter} data-modal="twitter" className="identity" handleToggle={this.handleToggle}>
          <div className="image-container d-flex align-items-center">
            <img src="/images/twitter-icon-dark.svg" role="presentation"/>
          </div>
          <h2>Verify Your Twitter Account</h2>
          <pre style={{ color: 'white', fontSize: '1.5rem' }}>To Do &#10003;</pre>
          <form onSubmit={(e) => {
            e.preventDefault()

            this.handleIdentity('twitter')
          }}>
            <div className="button-container">
              <a className="btn btn-clear" data-modal="twitter" onClick={this.handleToggle}>Cancel</a>
              <button type="submit" className="btn btn-clear">Continue</button>
            </div>
          </form>
        </Modal>
        <Modal isOpen={modalsOpen.unload} data-modal="unload" handleToggle={this.handleToggle}>
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
