'use strict'

import React from 'react'

import Preview from 'components/Preview'

class ThemePicker extends React.Component {
  constructor(props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)
    this.setWrapperRef = this.setWrapperRef.bind(this)
    this.themePreviewClassName = this.themePreviewClassName.bind(this)
  }

  componentWillMount() {
    document.addEventListener('mousedown', this.handleClick, false)
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClick, false)
  }

  handleClick(event) {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.props.onCollapse()
    }
  }

  setWrapperRef(node) {
    this.wrapperRef = node
  }

  themePreviewClassName(index) {
    let classNames = 'theme-preview'
    if (index === this.props.themeIndex) {
      classNames += ' active'
    }
    return classNames
  }

  render() {
    return (
      <div ref={this.setWrapperRef}>
        <div
          className={`theme-select form-control form-control-lg ${
            this.props.expanded ? 'expanded' : 'collapsed'
          }`}
          onClick={() =>
            this.props.expanded
              ? this.props.onCollapse()
              : this.props.onExpand()
          }
        >
          {this.props.themes[this.props.themeIndex].title}
        </div>
        {this.props.expanded && (
          <div className="theme-dropdown">
            <div className="row">
              {this.props.themes.map((theme, i) => (
                <div className="col-6" key={i}>
                  <div
                    className={this.themePreviewClassName(i)}
                    onClick={() => this.props.onThemeClick(i)}
                  >
                    <Preview config={theme} />
                    {theme.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }
}

require('react-styl')(`
  .theme-dropdown
    padding: 1rem
    border: 1px solid var(--light)
    margin-top: -1px
    border-bottom-left-radius: var(--default-radius)
    border-bottom-right-radius: var(--default-radius)

  .theme-select
    cursor: pointer
    position: relative

  .theme-select.collapsed:before
    content: ''
    position: absolute
    right: 15px
    top: 20px
    width: 0
    height: 0
    border-left: 10px solid transparent
    border-right: 10px solid transparent
    border-top: 10px solid var(--light)

  .theme-select.collapsed:after
    content: ''
    position: absolute
    right: 18px
    top: 20px
    width: 0
    height: 0
    border-left:7px solid transparent
    border-right: 7px solid transparent
    border-top: 7px solid var(--pale-grey-four)

  .theme-select.expanded
    border-bottom-left-radius: 0
    border-bottom-right-radius: 0

  .theme-select.expanded:before
    content: ''
    position: absolute
    right: 15px
    top: 20px
    width: 0
    height: 0
    border-left: 10px solid transparent
    border-right: 10px solid transparent
    border-bottom: 10px solid var(--light)

  .theme-select.expanded:after
    content: ''
    position: absolute
    right: 18px
    top: 23px
    width: 0
    height: 0
    border-left: 7px solid transparent
    border-right: 7px solid transparent
    border-bottom: 7px solid var(--pale-grey-four)

  .theme-preview
    padding: 0.5rem 0
    cursor: pointer
    text-align: center
    color: var(--dark)

  .theme-preview.active
    border: 1px solid var(--dark)
    border-radius: var(--default-radius)

  .theme-preview .preview-box
    margin: 1rem 3rem
`)

export default ThemePicker
