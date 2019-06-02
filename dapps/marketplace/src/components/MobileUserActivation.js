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
      title: fbt('Create a Profile', 'MobileUserActivation.createProfile')
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
    const { modal, shouldClose, title } = this.state

    if (!modal) {
      return null
    }

    return (
      <>
        <MobileModal
          onBack={() => {
            if (!this.state.prevStage) {
              this.setState({
                shouldClose: true
              })
            } else {
              this.setState({
                stage: this.state.prevStage
              })
            }
          }}
          onClose={() => this.onClose()}
          shouldClose={shouldClose}
          title={title}
        >
          <UserActivation
            stage={this.state.stage}
            onStageChanged={newStage => {
              switch (newStage) {
                case 'ProfileCreated':
                  this.setState({
                    prevStage: null,
                    title: null
                  })
                  break
                case 'VerifyEmail':
                case 'PublishDetail':
                  this.setState({
                    prevStage: 'AddEmail',
                    stage: newStage
                  })
                  break
                case 'AddEmail':
                default:
                  this.setState({
                    prevStage: null,
                    stage: newStage
                  })
                  break
              }
            }}
            onCompleted={() => {
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
