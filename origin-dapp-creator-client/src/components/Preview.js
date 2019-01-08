'use strict'

import React from 'react'

class Preview extends React.Component {
  constructor(props) {
    super(props)
  }

  render () {
    return (
      <div className="preview-box">
        <div className="row">
          <div className="col-4">
          </div>
          <div className="col-4">
          </div>
          <div className="col-4">
          </div>
        </div>
      </div>
    )
  }
}

require('react-styl')(`
  .preview-box
    border: 1px solid var(--light)
    border-radius: var(--default-radius)
    width: 100%
    height: 100%
`)

export default Preview
