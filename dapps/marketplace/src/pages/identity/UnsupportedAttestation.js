import React, { Component } from 'react'
import { fbt } from 'fbt-runtime'
import { withRouter } from 'react-router-dom'

import withIsMobile from 'hoc/withIsMobile'

import Modal from 'components/Modal'
import MobileModal from 'components/MobileModal'
import PublishedInfoBox from 'components/_PublishedInfoBox'

class UnsupportedAttestation extends Component {
  constructor(props) {
    super(props)
    this.state = {
      stage: 'GenerateCode'
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const didOpen = !prevProps.open && this.props.open,
      didChangeStage = prevState.stage !== this.state.stage
    if (this.inputRef && (didOpen || didChangeStage)) {
      this.inputRef.focus()
    }
  }

  render() {
    if (!this.props.open) {
      return null
    }

    const { isMobile } = this.props

    const ModalComp = isMobile ? MobileModal : Modal

    // Determine mobile platform to render the correct App Download link
    const mobilePlatform = /(iPhone|iPod|iPad)/.test(window.navigator.userAgent)
      ? 'ios'
      : 'android/other'

    return (
      <ModalComp
        title={
          <fbt desc="UnsupportedAttestation.verifyAccount">
            Verify Google Account
          </fbt>
        }
        className={`google attestation-modal oauth`}
        shouldClose={this.state.shouldClose}
        onClose={() => {
          const completed = this.state.completed

          if (completed) {
            this.props.onComplete(this.state.data)
          }

          this.setState({
            shouldClose: false,
            error: false,
            stage: 'GenerateCode',
            completed: false,
            data: null
          })

          this.props.onClose(completed)
          this.props.history.replace('/profile')
        }}
        lightMode={true}
        skipAnimateOnExit={this.props.skipAnimateOnExit}
      >
        <div>
          <h2>
            <fbt desc="UnsupportedAttestation.getAppHeader">
              Get the Origin Marketplace App
            </fbt>
          </h2>
          {this.state.error && (
            <div className="alert alert-danger mt-3">{this.state.error}</div>
          )}
          <PublishedInfoBox
            title={fbt(
              'Unsupported Browser',
              'UnsupportedAttestation.infoBoxTitle'
            )}
            pii={true}
          >
            <fbt desc="UnsupportedAttestation.infoBoxContent">
              Your browser does not support Google verification. Please use our
              mobile app instead.
            </fbt>
          </PublishedInfoBox>
          <div className="actions mt-5">
            <a
              className="btn btn-primary"
              href={
                mobilePlatform === 'ios'
                  ? 'https://itunes.apple.com/us/app/apple-store/id1446091928?mt=8'
                  : 'https://originprotocol.com/mobile'
              }
            >
              <fbt desc="UnsupportedAttestation.getAppButton">
                Get the Origin App
              </fbt>
            </a>
          </div>
        </div>
      </ModalComp>
    )
  }
}

export default withIsMobile(withRouter(UnsupportedAttestation))

require('react-styl')(`
  .mobile-modal-light .attestation-modal.oauth:not(.success) h2
    padding-top: 9rem
`)
