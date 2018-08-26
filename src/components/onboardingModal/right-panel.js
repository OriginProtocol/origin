import React, { Component } from 'react'
import PanelButtons from './panel-buttons'

export default class RightPanel extends Component {
  render() {
    const {img, heading, content, name} = this.props.step

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
