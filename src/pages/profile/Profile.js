import React, { Component } from 'react'
import { connect } from 'react-redux'
import $ from 'jquery'

import { deployProfile, updateProfile, addAttestation } from 'actions/Profile'
import { getBalance } from 'actions/Wallet'

import Timelapse from 'components/timelapse'

import countryOptions from './_countryOptions'
import Services from './_Services'
import Wallet from './_Wallet'
import Guidance from './_Guidance'

import EditProfile from './EditProfile'
import VerifyPhone from './VerifyPhone'
import VerifyEmail from './VerifyEmail'
import VerifyFacebook from './VerifyFacebook'
import VerifyTwitter from './VerifyTwitter'
import ConfirmExit from './ConfirmExit'

class Profile extends Component {
  constructor(props) {
    super(props)

    this.handleIdentity = this.handleIdentity.bind(this)
    this.handlePublish = this.handlePublish.bind(this)
    this.handleToggle = this.handleToggle.bind(this)
    this.handleUnload = this.handleUnload.bind(this)
    this.setProgress = this.setProgress.bind(this)
    /*
      Three-ish Profile States

      published: Published to blockchain
      provisional: Ready to publish to blockchain
      userForm: Values for controlled components
      * TODO: retrieve current profile from blockchain
      * TODO: cache provisional state with local storage (if approved by Stan/Matt/Josh)
    */

    const { firstName, lastName, description } = this.props.provisional

    this.state = {
      lastPublish: null,
      address: props.address,
      userForm: { firstName, lastName, description },
      phoneForm: {
        countryCode: 'us',
        number: '',
        verificationCode: '',
        verificationRequested: false
      },
      modalsOpen: {
        email: false,
        facebook: false,
        phone: false,
        profile: false,
        twitter: false,
        unload: false
      },
      // percentage widths for two progress bars
      progress: {
        provisional: 0,
        published: 0
      },
      provisional: props.provisional
    }
  }

  componentDidMount() {
    this.props.getBalance()
  }

  componentDidUpdate(prevProps, prevState) {
    const { phoneForm, userForm } = this.state

    // prompt user if tab/window is closing before changes have been published
    if (this.props.hasChanges) {
      $('.profile-wrapper [data-toggle="tooltip"]').tooltip()
      // window.addEventListener('beforeunload', this.handleUnload)
    } else {
      // window.removeEventListener('beforeunload', this.handleUnload)
    }

    // concatenate phone number segments when country code or number is changed
    if (
      prevState.phoneForm.countryCode !== phoneForm.countryCode ||
      prevState.phoneForm.number !== phoneForm.number
    ) {
      const obj = Object.assign({}, userForm, {
        phone: `${
          countryOptions.find(c => c.code === phoneForm.countryCode).prefix
        }${phoneForm.number}`
      })

      this.setState({ userForm: obj })
    }

    if (
      prevProps.provisionalProgress !== this.props.provisionalProgress ||
      prevProps.publishedProgress !== this.props.publishedProgress
    ) {
      this.setProgress({
        provisional: this.props.provisionalProgress,
        published: this.props.publishedProgress
      })
    }
  }

  // initiate validation sequence for the named identity service
  handleIdentity(name) {
    const modalsOpen = Object.assign({}, this.state.modalsOpen, {
      [name]: false
    })
    // TODO: use token or hashed/salted value instead of boolean to indicate verification
    let obj = Object.assign({}, this.state.provisional, { [name]: true })

    this.setState({ modalsOpen, provisional: obj })

    let { provisional, published } = this.state.progress

    this.setProgress({
      provisional: provisional + (100 - published - provisional) / 2,
      published
    })
  }

  // copy provisional state to published and run optional callback
  handlePublishSuccess(cb) {
    const { provisional, progress } = this.state

    this.setState({ lastPublish: new Date(), published: provisional })
    this.setProgress({
      provisional: 0,
      published: progress.provisional + progress.published
    })

    typeof cb === 'function' && cb()
  }

  // conditionally close modal identified by data attribute
  handleToggle(e) {
    const { modal } = e.currentTarget.dataset

    /*
      We currently ignore the click if the identity has been verified.
      TODO: Allow provisional validations to be reviewed and/or
      undone individually before publishing to the blockchain.
    */
    if (this.props.published[modal] || this.state.provisional[modal]) {
      return
    }

    let modalsOpen = Object.assign({}, this.state.modalsOpen)

    for (let k in modalsOpen) {
      if (modalsOpen.hasOwnProperty(k)) {
        modalsOpen[k] = k === modal ? !modalsOpen[k] : false
      }
    }

    this.setState({ modalsOpen })
  }

  // warning message will be ignored by the native dialog in Chrome and Firefox
  handleUnload(e) {
    const message =
      "If you exit without publishing, you'll lose all your changes."
    const modalsOpen = Object.assign({}, this.state.modalsOpen, {
      unload: true
    })

    // modal will only render if user cancels unload using native dialog
    this.setState({ modalsOpen })

    e.returnValue = message

    return message
  }

  // cause profile strength counter to increment (gradually) and progress bar to widen
  setProgress(progress) {
    const strength = progress.provisional + progress.published
    let i = this.props.strength

    // lots of state changes here, there may be a better way to increment counter
    this.int = setInterval(() => {
      i += 1

      if (i > strength) {
        return clearInterval(this.int)
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
    const { lastPublish, modalsOpen, phoneForm, progress } = this.state

    const { provisional, published } = this.props

    const fullName = `${provisional.firstName} ${provisional.lastName}`.trim()
    const hasChanges = this.props.hasChanges

    return (
      <div className="profile-wrapper">
        <div className="container">
          <div className="row">
            <div className="col-12 col-lg-8">
              <div className="row attributes">
                <div className="col-4 col-md-3">
                  <div
                    className="avatar-container"
                    style={{ backgroundImage: `url(${provisional.pic})` }}
                  />
                </div>
                <div className="col-8 col-md-9">
                  <div className="name d-flex">
                    <h1>{fullName.length ? fullName : 'Unnamed User'}</h1>
                    <div className="icon-container">
                      <button
                        className="edit-profile"
                        data-modal="profile"
                        onClick={this.handleToggle}
                      >
                        <img src="/images/edit-icon.svg" alt="edit name" />
                      </button>
                    </div>
                  </div>
                  <p>{provisional.description}</p>
                </div>
              </div>
              {hasChanges && (
                <div className="alert d-flex">
                  Your profile includes unpublished changes.
                  <div
                    className="info icon-container"
                    data-toggle="tooltip"
                    title="Tell me more about what it means to publish and why I should do it."
                  />
                </div>
              )}
              <h2>Verify yourself on Origin</h2>
              <Services
                published={published}
                provisional={provisional}
                handleToggle={this.handleToggle}
              />

              <div className="d-flex justify-content-between">
                <h2>Profile Strength</h2>
                <h2>{this.props.profile.strength}%</h2>
              </div>
              <div className="progress">
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{ width: `${progress.published}%` }}
                  aria-valuenow={progress.published}
                  aria-valuemin="0"
                  aria-valuemax="100"
                />
                <div
                  className="progress-bar provisional"
                  role="progressbar"
                  style={{ width: `${progress.provisional}%` }}
                  aria-valuenow={progress.provisional}
                  aria-valuemin="0"
                  aria-valuemax="100"
                />
              </div>
              {hasChanges && (
                <button
                  className="publish btn btn-primary d-block"
                  onClick={this.handlePublish}
                >
                  Publish Now
                </button>
              )}
              {lastPublish && (
                <p className="timelapse text-center">
                  Last Published <Timelapse reference={lastPublish} />
                </p>
              )}
            </div>
            <div className="col-12 col-lg-4">
              <Wallet
                balance={this.props.balance}
                address={this.props.address}
              />
              <Guidance />
            </div>
          </div>
        </div>

        <EditProfile
          open={modalsOpen.profile}
          handleToggle={this.handleToggle}
          handleSubmit={data => {
            this.props.updateProfile(data)
            this.setState({
              modalsOpen: { ...this.state.modalsOpen, profile: false }
            })
          }}
          data={this.props.profile.provisional}
        />

        <VerifyPhone
          open={modalsOpen.phone}
          phoneForm={phoneForm}
          handleToggle={this.handleToggle}
          handleIdentity={this.handleIdentity}
          updateForm={phoneForm => this.setState({ phoneForm })}
        />

        <VerifyEmail
          open={modalsOpen.email}
          wallet={this.props.address}
          handleToggle={this.handleToggle}
          onSuccess={data => {
            this.props.addAttestation(data)
            this.setState({
              modalsOpen: { ...this.state.modalsOpen, email: false }
            })
          }}
        />

        <VerifyFacebook
          open={modalsOpen.facebook}
          handleToggle={this.handleToggle}
          account={this.props.address}
          onSuccess={data => {
            this.props.addAttestation(data)
            this.setState({
              modalsOpen: { ...this.state.modalsOpen, facebook: false }
            })
          }}
        />

        <VerifyTwitter
          open={modalsOpen.twitter}
          handleToggle={this.handleToggle}
          onSuccess={data => {
            this.props.addAttestation(data)
            this.setState({
              modalsOpen: { ...this.state.modalsOpen, twitter: false }
            })
          }}
        />

        <ConfirmExit
          open={modalsOpen.unload}
          handleToggle={this.handleToggle}
          handlePublish={this.handlePublish}
        />
      </div>
    )
  }

  handlePublish() {
    this.props.deployProfile({
      facebook: this.state.facebookForm,
      user: this.state.userForm
    })
  }
}

Profile.getDerivedStateFromProps = (nextProps, prevState) => {
  var newState = {}
  if (nextProps.address && !prevState.address) {
    newState = {
      ...newState,
      provisional: nextProps.published,
      userForm: {
        firstName: nextProps.published.firstName,
        lastName: nextProps.published.lastName,
        description: nextProps.published.description
      }
    }
  }
  return newState
}

const mapStateToProps = state => {
  return {
    deployResponse: state.profile.deployResponse,
    issuer: state.profile.issuer,
    address: state.wallet.address,
    published: state.profile.published,
    provisional: state.profile.provisional,
    strength: state.profile.strength,
    hasChanges: state.profile.hasChanges,
    provisionalProgress: state.profile.provisionalProgress,
    publishedProgress: state.profile.publishedProgress,
    profile: state.profile,
    balance: state.wallet.balance
  }
}

const mapDispatchToProps = dispatch => ({
  deployProfile: opts => dispatch(deployProfile(opts)),
  updateProfile: data => dispatch(updateProfile(data)),
  addAttestation: data => dispatch(addAttestation(data)),
  getBalance: () => dispatch(getBalance())
})

export default connect(mapStateToProps, mapDispatchToProps)(Profile)
