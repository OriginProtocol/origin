import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { fbt } from 'fbt-runtime'

import MobileModal from './MobileModal'
import UserActivation from './DesktopUserActivation'

class MobileUserActivation extends Component {
  constructor(props) {
    super(props)
    this.state = {
      stage: 'AddEmail',
      modal: true,
      shouldClose: false,
      title: fbt('Create a profile', 'MobileUserActivation.createProfile')
    }

    this.portal = document.createElement('div')
  }

  componentDidMount() {
    document.body.appendChild(this.portal)
  }

  render() {
    return ReactDOM.createPortal(this.renderPortal(), this.portal)
  }

  renderPortal() {
    const { modal, shouldClose, title, className, headerImageUrl, stage, prevStage } = this.state

    if (!modal) {
      return null
    }
    
    return (
      <>
        <MobileModal
          onBack={() => {
            if (!prevStage) {
              this.setState({
                shouldClose: true
              })
            } else {
              this.setState({
                stage: prevStage
              })
            }
          }}
          onClose={() => this.onClose()}
          shouldClose={shouldClose}
          title={title}
          className={className}
          showBackButton={stage !== 'RewardsSignUp'}
          headerImageUrl={headerImageUrl}
        >
          <UserActivation
            stage={stage}
            onStageChanged={newStage => {
              let newState = {
                prevStage: null,
                title: fbt('Create a profile', 'MobileUserActivation.createProfile'),
                stage: newStage,
                headerImageUrl: null
              }
              switch (newStage) {
                case 'ProfileCreated':
                  newState.title = null
                  break
                case 'VerifyEmail':
                  newState.prevStage = 'AddEmail'
                  break
                case 'PublishDetail':
                  newState = {
                    ...newState,
                    prevStage: 'AddEmail',
                    title: fbt('Add name & photo', 'UserActivation.addNameAndPhoto')
                  }
                  break
                case 'RewardsSignUp':
                  newState = {
                    ...newState,
                    className: `rewards-signup ${className ? ' ' + className : ''}`,
                    title: fbt('Get Rewards', 'UserActivation.getRewards'),
                    headerImageUrl: 'images/tout-header-image@3x.png'
                  }
                  break
              }

              this.setState(newState)
            }}
            onCompleted={() => {
              this.setState({
                shouldClose: true
              })
            }}
            onAccountBlocked={() => {
              this.setState({
                shouldClose: true
              })
            }}
            renderMobileVersion={true}
          />
        </MobileModal>
      </>
    )
  }

  onClose() {
    document.body.removeChild(this.portal)

    this.setState({
      modal: false
    })
    if (this.props.onClose) {
      this.props.onClose()
    }
  }
}

export default MobileUserActivation

require('react-styl')(`
  .rewards-signup.modal-header
    height: 200px
    .modal-title
      color: white
`)
