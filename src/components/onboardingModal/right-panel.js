import React, { Component } from 'react'
import PanelButtons from './panel-buttons'

export default class RightPanel extends Component {
  render() {
    const { currentStep={}, displayNextStep } = this.props
    const {img, heading, content, name, subStep} = currentStep

    if (currentStep.complete && subStep) {
      return(
        <div className="flex-column col-8 right-panel">
          <div className="text-right">
            <img src="/images/close-icon.svg" alt="close-icon" />
          </div>
          {subStep.img}
          <div>
            {subStep.heading}
            {subStep.content}
            <PanelButtons {...this.props}/>
          </div>
        </div>
      )
    }

    return(
      <div className="flex-column col-8 right-panel">
        <div className="text-right">
          <img src="/images/close-icon.svg" alt="close-icon" />
        </div>
        {img}
        <div>
          {heading}
          {content}
          <PanelButtons {...this.props}/>
        </div>
      </div>
    )
  }
}
