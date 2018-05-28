import React, { Component } from 'react'
import { connect } from 'react-redux'
import $ from 'jquery'

import { storeWeb3Intent } from 'actions/App'
import {
  deployProfile,
  deployProfileReset,
  updateProfile,
  addAttestation
} from 'actions/Profile'
import { getBalance } from 'actions/Wallet'

import Avatar from 'components/avatar'
import Modal from 'components/modal'
import Timelapse from 'components/timelapse'

import Services from './_Services'
import Wallet from './_Wallet'
import Guidance from './_Guidance'
import Strength from './_Strength'

import EditProfile from './EditProfile'
import VerifyPhone from './VerifyPhone'
import VerifyEmail from './VerifyEmail'
import VerifyFacebook from './VerifyFacebook'
import VerifyTwitter from './VerifyTwitter'
import ConfirmPublish from './ConfirmPublish'
import ConfirmUnload from './ConfirmUnload'
import AttestationSuccess from './AttestationSuccess'

class Profile extends Component {
  constructor(props) {
    super(props)

    this.handleToggle = this.handleToggle.bind(this)
    this.handleUnload = this.handleUnload.bind(this)
    this.setProgress = this.setProgress.bind(this)
    /*
      Three-ish Profile States

      published: Published to blockchain
      provisional: Ready to publish to blockchain
      userForm: Values for controlled components
      * TODO: cache provisional state with local storage
    */

    const { firstName, lastName, description } = this.props.provisional

    this.state = {
      lastPublish: null,
      address: props.address,
      userForm: { firstName, lastName, description },
      modalsOpen: {
        attestationSuccess: false,
        email: false,
        facebook: false,
        phone: false,
        profile: false,
        publish: false,
        twitter: false,
        unload: false,
      },
      // percentage widths for two progress bars
      progress: {
        provisional: 0,
        published: 0,
      },
      provisional: props.provisional,
      successMessage: '',
    }
  }

  componentDidMount() {
    this.props.getBalance()
  }

  componentDidUpdate(prevProps) {
    // prompt user if tab/window is closing before changes have been published
    if (!!this.props.changes.length) {
      $('.profile-wrapper [data-toggle="tooltip"]').tooltip()

      window.addEventListener('beforeunload', this.handleUnload)
    } else {
      window.removeEventListener('beforeunload', this.handleUnload)
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

  // conditionally close modal identified by data attribute
  handleToggle(e) {
    e.preventDefault()

    this.props.storeWeb3Intent('manage your profile')

    if (web3.givenProvider && this.props.web3Account) {
      const { modal } = e.currentTarget.dataset

      /*
        We currently ignore the click if the identity has been verified.
        TODO: Allow provisional validations to be reviewed and/or
        undone individually before publishing to the blockchain.
      */
      if (this.props.published[modal] || this.props.provisional[modal]) {
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
    const { modalsOpen, progress, successMessage } = this.state

    const { changes, provisional, published, profile, lastPublish } = this.props

    const fullName = `${provisional.firstName} ${provisional.lastName}`.trim()
    const hasChanges = !!changes.length
    const description = provisional.description || 'An Origin user without a description'

    let statusClassMap = {
      unpublished: 'not-published'
    }
    let statusTextMap = {
      unpublished: 'Not Published'
    }

    let publishStatus, hasPublishedAllChanges = false
    if (hasChanges) {
      publishStatus = 'unpublished'
    } else if(lastPublish) {
      publishStatus = 'published'
      hasPublishedAllChanges = true
    }
    let statusClass = statusClassMap[publishStatus]
    let statusText = statusTextMap[publishStatus]

    return (
      <div className="current-user profile-wrapper">
        <div className="container">
          <div className="row">
            <div className="col-12 col-lg-8">
              <div className="row attributes">
                <div className="col-4 col-md-3">
                  <Avatar image={provisional.pic} className="primary" placeholderStyle="unnamed" />
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
                        <img src="images/edit-icon.svg" alt="edit name" />
                      </button>
                    </div>
                  </div>
                  <p>{description}</p>
                </div>
              </div>

              <h2>Verify yourself on Origin</h2>
              <Services
                published={published}
                provisional={provisional}
                handleToggle={this.handleToggle}
              />

              <div className="col-12">
                <Strength strength={profile.strength} progress={progress} />
                {!hasChanges && (
                  <button
                    className="publish btn btn-sm btn-primary d-block"
                    disabled
                  >
                    Publish Now
                  </button>
                )}
                {hasChanges && (
                  <button
                    className="publish btn btn-sm btn-primary d-block"
                    onClick={() => {
                      this.setState({
                        modalsOpen: { ...modalsOpen, publish: true }
                      })
                    }}
                  >
                    Publish Now
                  </button>
                )}
                {publishStatus && (
                  <div className="published-status text-center">
                    <span>Status:</span>
                    <span className={statusClass}>
                      {statusText}
                    </span>
                    {hasPublishedAllChanges && (
                      <span>
                        Last published
                        {' '}
                        <Timelapse reactive={true} reference={lastPublish} />
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="col-12 col-lg-4">
              <Wallet
                balance={this.props.balance}
                address={this.props.address}
                identityAddress={this.props.identityAddress}
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
              modalsOpen: { ...modalsOpen, profile: false }
            })
          }}
          data={profile.provisional}
        />

        <VerifyPhone
          open={modalsOpen.phone}
          handleToggle={this.handleToggle}
          onSuccess={data => {
            this.props.addAttestation(data)
            this.setState({
              successMessage: 'Phone number verified!',
              modalsOpen: { ...modalsOpen, phone: false, attestationSuccess: true }
            })
          }}
        />

        <VerifyEmail
          open={modalsOpen.email}
          wallet={this.props.address}
          handleToggle={this.handleToggle}
          onSuccess={data => {
            this.props.addAttestation(data)
            this.setState({
              successMessage: 'Email address verified!',
              modalsOpen: { ...modalsOpen, email: false, attestationSuccess: true }
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
              successMessage: 'Facebook account verified!',
              modalsOpen: { ...modalsOpen, facebook: false, attestationSuccess: true }
            })
          }}
        />

        <VerifyTwitter
          open={modalsOpen.twitter}
          handleToggle={this.handleToggle}
          onSuccess={data => {
            this.props.addAttestation(data)
            this.setState({
              successMessage: 'Twitter account verified!',
              modalsOpen: { ...modalsOpen, twitter: false, attestationSuccess: true }
            })
          }}
        />

        <ConfirmPublish
          open={modalsOpen.publish}
          changes={changes}
          handleToggle={this.handleToggle}
          handlePublish={this.handlePublish}
          onConfirm={() => {
            this.setState({
              modalsOpen: { ...modalsOpen, publish: false },
              step: 'metamask'
            })
            this.props.deployProfile({
              facebook: this.state.facebookForm,
              user: this.state.userForm
            })
          }}
        />

        <ConfirmUnload
          open={modalsOpen.unload}
          changes={changes}
          handleToggle={this.handleToggle}
          handlePublish={this.handlePublish}
          onConfirm={() => {
            this.setState({
              modalsOpen: { ...modalsOpen, unload: false },
              step: 'metamask'
            })
            this.props.deployProfile({
              facebook: this.state.facebookForm,
              user: this.state.userForm
            })
          }}
        />

        <AttestationSuccess
          open={modalsOpen.attestationSuccess}
          message={successMessage}
          handleToggle={this.handleToggle}
        />

        {this.props.profile.status === 'confirming' && (
          <Modal backdrop="static" isOpen={true}>
            <div className="image-container">
              <img src="images/spinner-animation.svg" role="presentation" />
            </div>
            Confirm transaction<br />
            Press &ldquo;Submit&rdquo; in MetaMask window
          </Modal>
        )}

        {this.props.profile.status === 'processing' && (
          <Modal backdrop="static" isOpen={true}>
            <div className="image-container">
              <img src="images/spinner-animation.svg" role="presentation" />
            </div>
            Deploying your identity<br />
            Please stand by...
          </Modal>
        )}

        {this.props.profile.status === 'error' && (
          <Modal backdrop="static" isOpen={true}>
            <div className="image-container">
              <img src="images/flat_cross_icon.svg" role="presentation" />
            </div>
            <h2>Error</h2>
            <div>See the console for more details</div>
            <div className="button-container">
              <button
                className="btn btn-clear"
                onClick={this.props.deployProfileReset}
              >
                OK
              </button>
            </div>
          </Modal>
        )}

        {this.props.profile.status === 'success' && (
          <Modal backdrop="static" isOpen={true}>
            <div className="image-container">
              <img
                src="images/circular-check-button.svg"
                role="presentation"
              />
            </div>
            <h2>Success</h2>
            <div className="button-container">
              <button
                className="btn btn-clear"
                onClick={this.props.deployProfileReset}
              >
                Continue
              </button>
            </div>
          </Modal>
        )}
      </div>
    )
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
    changes: state.profile.changes,
    lastPublish: state.profile.lastPublish,
    provisionalProgress: state.profile.provisionalProgress,
    publishedProgress: state.profile.publishedProgress,
    profile: state.profile,
    balance: state.wallet.balance,
    identityAddress: state.profile.user.identityAddress,
    onMobile: state.app.onMobile,
    web3Account: state.app.web3.account,
    web3Intent: state.app.web3.intent,
  }
}

const mapDispatchToProps = dispatch => ({
  deployProfile: opts => dispatch(deployProfile(opts)),
  deployProfileReset: () => dispatch(deployProfileReset()),
  updateProfile: data => dispatch(updateProfile(data)),
  addAttestation: data => dispatch(addAttestation(data)),
  getBalance: () => dispatch(getBalance()),
  storeWeb3Intent: intent => dispatch(storeWeb3Intent(intent)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Profile)
