'use strict'

import React from 'react'

import Preview from 'components/Preview'

class ThemePicker extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      expanded: null
    }

    this.handleClick = this.handleClick.bind(this)
    this.setWrapperRef = this.setWrapperRef.bind(this)
    this.themeConfig = this.themeConfig.bind(this)
  }

  componentWillMount() {
    document.addEventListener('mousedown', this.handleClick, false)
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClick, false)
  }

  handleClick (event) {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.setState({ expanded: false })
    }
  }

  setWrapperRef(node) {
    this.wrapperRef = node
  }

  themeConfig(theme) {
    return {
      cssVars: {
        ...this.props.config.cssVars,
        ...theme.cssVars
      }
    }
  }

  render () {
    return (
      <div ref={this.setWrapperRef}>
        <div className="theme-select form-control form-control-lg"
            onClick={() => this.setState({ expanded: true })}>
          {this.props.themes[this.props.themeIndex].title}
        </div>
        {this.state.expanded &&
          <div className="theme-dropdown">
            <div className="row">
              {this.props.themes.map((theme, i) =>
                <div className="theme-preview col-6" key={i}>
                  <Preview config={this.themeConfig(theme)} />
                  {theme.title}
                </div>
              )}
            </div>
          </div>
        }
      </div>
    )
  }
}

require('react-styl')(`
  .theme-preview
    cursor: pointer
`)

export default ThemePicker
