import React, { Component } from 'react'

import Languages from '../constants/Languages'
import Dropdown from 'components/Dropdown'

const LanguagesByKey = Languages.reduce((m, o) => {
  m[o[0]] = o[1]
  return m
}, {})

class LocaleDropdown extends Component {
  constructor(props) {
    super(props)
    this.state = {
      open: false
    }
  }

  render () {
    return (
      <Dropdown
        className="dropup"
        content={
          <div className="dropdown-menu show">
            {Languages.map(lang => (
              <a
                className="dropdown-item"
                key={lang[0]}
                title={lang[0]}
                href="#"
                onClick={e => {
                  e.preventDefault()
                  this.props.onLocale(lang[0])
                  this.setState({ open: false })
                }}
                children={lang[1]}
              />
            ))}
          </div>
        }
        open={this.state.open}
        onClose={() => this.setState({ open: false })}
      >
        <a
          href="#"
          className={this.props.className}
          onClick={e => {
            e.preventDefault()
            this.setState({ open: !this.state.open })
          }}
        >
          {LanguagesByKey[this.props.locale]}
        </a>
      </Dropdown>
    )
  }
}

export default LocaleDropdown
