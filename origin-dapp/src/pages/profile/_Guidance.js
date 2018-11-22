import React, { Component } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import { connect } from 'react-redux'

class Guidance extends Component {
  render() {
    const { mobileDevice } = this.props
    let wrapperClass, imageWrapperClass, textClass
    
    if (mobileDevice){
      wrapperClass = 'guidance row'
      imageWrapperClass = 'pl-0 col-4'
      textClass = 'col-8'
    } else {
      wrapperClass = 'guidance'
      imageWrapperClass = 'image-container text-center'
      textClass = ''
    }

    return (
      <div className={wrapperClass}>
        <div className={imageWrapperClass}>
          <img src="images/identity.svg" alt="identity icon" />
        </div>
        <p className={textClass}>
          <FormattedMessage
            id={'_Guidance.content'}
            defaultMessage={
              '{verifyingYourProfile} allows other users to know that you are a real person and increases the chances of successful transactions on Origin.'
            }
            values={{
              verifyingYourProfile: (
                <strong>
                  <FormattedMessage
                    id={'_Guidance.verifyingYourProfile'}
                    defaultMessage={'Verifying your profile'}
                  />
                </strong>
              )
            }}
          />
        </p>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    mobileDevice: state.app.mobileDevice
  }
}

const mapDispatchToProps = dispatch => ({})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(Guidance))
