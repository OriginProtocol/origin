import React, { Component } from 'react'

function padOneLeft(s) {
  if (!s) return ''
  return ` ${s}`
}

class Toggle extends Component {
  constructor(props) {
    super(props)

    this.state = {
      isToggledOn: this.props.initialToggleState
    }

    this.handleClick = this.handleClick.bind(this)
  }

  handleClick() {
    const newToggled = !this.state.isToggledOn
    this.setState({
      isToggledOn: newToggled
    })
    if (!this.props.onClickHandler) return
    return this.props.onClickHandler(newToggled)
  }

  render() {
    const parentClassName = `toggle${
      this.state.isToggledOn ? padOneLeft('toggle-on') : ''
    }${this.props.className ? padOneLeft(this.props.className) : ''}`
    return (
      <div className={parentClassName} onClick={this.handleClick}>
        <div className="toggle-switch" />
      </div>
    )
  }
}

export default Toggle

require('react-styl')(`
  .toggle
    cursor: pointer
    width: 60px
    height: 30px
    border-radius: 15px
    border: solid 1px var(--bluey-grey)
    background-color: var(--pale-grey-two)

    &.toggle-on
      background-color: #1a82ff
      .toggle-switch
        left: 30px

    .toggle-switch
      position: relative;
      top: -1px;
      width: 30px
      height: 30px
      border-radius: 15px
      border: solid 1px var(--bluey-grey)
      background-color: var(--white)
`)
