import React, { Component } from 'react'
import PanelButtons from './panel-buttons'

export default class RightPanel extends Component {
  render() {
    const { step, closeModal } = this.props
    const {img, heading, content, name} = step

    return (
      <div className="flex-column col-8 right-panel">
        <div className="text-right mt-2">
          <img src="/images/close-icon.svg" alt="close-icon" onClick={closeModal}/>
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
