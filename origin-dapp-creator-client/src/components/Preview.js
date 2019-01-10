'use strict'

import React from 'react'

class Preview extends React.Component {
  constructor(props) {
    super(props)
  }

  render () {
    return (
      <div className="preview-box">
        <div className="navbar"
          style={{ background: this.props.config.cssVars.dusk }}>
        </div>
        <div className="searchbar"
          style={{ background: this.props.config.cssVars.paleGrey }}>
        </div>
        {[...Array(this.props.rows || 2)].map((x, i) =>
          <div className="listings" key={'listings-' + i}>
            {[...Array(3)].map((x, y) =>
              <div className="listing" key={'listing-' + y}>
                <div className="listing-image"></div>
                <div className="listing-desc">
                  <div className="listing-text">
                    <div className="listing-text-line"
                      style={{  background: this.props.config.cssVars.dark }}>
                    </div>
                    <div className="listing-text-line"
                      style={{  background: this.props.config.cssVars.dark }}>
                    </div>
                  </div>
                  <div className="listing-featured-tag"
                    style={{ background: this.props.config.cssVars.goldenRod }}>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div className="footer"
          style={{ background: this.props.config.cssVars.lightFooter }}>
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

  .navbar
    width: 100%
    height: 1.5rem

  .searchbar
    width: 100%
    height: 1.5rem

  .footer
    height: 3rem

  .listings
    display: flex
    justify-content: space-around
    padding: 1rem 1rem 1rem 0

  .listing
    flex: 0 0 33.333333%
    max-width: 33.333333%
    padding-left: 1rem

  .listing-image
    height: 3rem;
    background-color: var(--pale-grey-two)

  .listing-desc
    display: flex
    justify-content: space-between

  .listing-text
    width: 78%

  .listing-text-line
    height: 2px
    margin-top: 2px
    width: 100%
    background-color: var(--dark)
    display: block

  .listing-featured-tag
    margin-top: 2px
    height: 7px
    width: 20%
    border-radius: 2px
`)

export default Preview
