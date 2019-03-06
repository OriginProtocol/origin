import React, { Component } from 'react'
import { Mutation } from 'react-apollo'

import mutation from 'mutations/LinkMobileWallet'

import MobileLinkerCode from 'components/MobileLinkerCode'

class LinkMobileWallet extends Component {
  state = {}

  render() {
    return (
      <Mutation mutation={mutation}>
        {linkMobileWallet => (
          <>
            <button
              className={this.props.className}
              onClick={e => {
                e.stopPropagation()
                linkMobileWallet()
                this.setState({ open: true })
              }}
              children={this.props.children}
            />
            {!this.state.open ? null : (
              <MobileLinkerCode
                onClose={() => this.setState({ open: false })}
              />
            )}
          </>
        )}
      </Mutation>
    )
  }
}

export default LinkMobileWallet

require('react-styl')(`
`)
