import React, { Component } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import { connect } from 'react-redux'

class Guidance extends Component {
  constructor() {
    super()
    this.state = {
      expanded: false,
      dismissed: false
    }

    this.onLearnMoreClick = this.onLearnMoreClick.bind(this)
    this.onDismissClick = this.onDismissClick.bind(this)
  }

  onLearnMoreClick(e) {
    e.stopPropagation()
    this.setState({ expanded: !this.state.expanded })
  }

  onDismissClick(e) {
    e.stopPropagation()
    this.setState({ dismissed: true })
  }

  render() {
    const { mobileDevice } = this.props

    const strongVerifyProfile = (
      <strong>
        <FormattedMessage
          id={'_Guidance.verifyingYourProfile'}
          defaultMessage={'Verifying your profile'}
        />
      </strong>
    )
    const guidanceMessage = (<FormattedMessage
      id={'_Guidance.content'}
      defaultMessage={
        '{verifyingYourProfile} allows other users to know that you are a real person and increases the chances of successful transactions on Origin.'
      }
      values={{
        verifyingYourProfile: strongVerifyProfile
      }}
    />)
    const shortGuidanceMessage = (<FormattedMessage
      id={'_Guidance.contentShort'}
      defaultMessage={
        '{verifyingYourProfile} allows others to know and trust you.'
      }
      values={{
        verifyingYourProfile: strongVerifyProfile
      }}
    />)

    let wrapperClass, imageWrapperClass, textClass, guidanceText
    let showGuidance = true
    if (mobileDevice){
      wrapperClass = 'guidance row mb-0'
      imageWrapperClass = 'pl-0 pr-0 col-2'
      textClass = 'col-10'
      guidanceText = this.state.expanded ? guidanceMessage : shortGuidanceMessage
      showGuidance = !this.state.dismissed

    } else {
      wrapperClass = 'guidance'
      imageWrapperClass = 'image-container text-center'
      textClass = ''
      guidanceText = guidanceMessage
    }

    return showGuidance && (
      <div className={wrapperClass}>
        <div className={imageWrapperClass}>
          <img src="images/identity.svg" alt="identity icon" />
        </div>
        <div className={textClass}>
          <p>
            {guidanceText}
          </p>
          {mobileDevice && (<div>
              <a
                className="pr-3"
                onClick={this.onLearnMoreClick}
                href="javascript:void(0);"
              >
              {this.state.expanded ?
                (<FormattedMessage
                  id={'_Guidance.showLess'}
                  defaultMessage={'Show less'}
                />)
              :
                (<FormattedMessage
                  id={'_Guidance.learnMore'}
                  defaultMessage={'Learn more'}
                />)
              }
              </a>
              <a
                onClick={this.onDismissClick}
                href="javascript:void(0);"
              >
                <FormattedMessage
                  id={'_Guidance.dismiss'}
                  defaultMessage={'Dismiss'}
                />
              </a>
            </div>
          )}
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    mobileDevice: state.app.mobileDevice
  }
}

const mapDispatchToProps = () => ({})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(Guidance))
