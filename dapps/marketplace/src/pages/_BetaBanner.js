import React, { Component } from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'

import Store from 'utils/store'
import NetworkQuery from 'queries/Network'
import Tooltip from 'components/Tooltip'
import BetaModal from './_BetaModal'

const store = Store('sessionStorage')
const GitHubLink = 'https://github.com/OriginProtocol/origin-dapp/issues/new'
const SupportEmail = 'support@originprotocol.com'

class BetaBanner extends Component {
  state = {
    hideBanner: store.get('hide-beta-banner', false)
  }
  render() {
    if (this.state.hideBanner) {
      return null
    }
    return (
      <Query query={NetworkQuery}>
        {({ data }) => {
          const networkName = get(data, 'web3.networkName', '')
          return (
            <>
              <div className="beta-banner sm align-items-center d-block d-md-none">
                <div className="container align-items-center d-flex">
                  <div className="badge badge-primary">Beta</div>
                  Welcome to the Origin Beta!
                  <a
                    className="close-banner"
                    href="#"
                    onClick={e => this.onHide(e)}
                    children="×"
                  />
                </div>
              </div>
              <div className="beta-banner lg d-none d-md-block">
                <div className="container align-items-center d-flex">
                  <div className="badge badge-primary">Beta</div>
                  <div>
                    <div>
                      {`You're currently using the Origin Beta on ${networkName}. `}
                      <a
                        href="#"
                        onClick={e => {
                          e.preventDefault()
                          this.setState({ reminders: true })
                        }}
                        children="Important Reminders"
                      />
                      {!this.state.reminders ? null : (
                        <BetaModal
                          onClose={() => this.setState({ reminders: false })}
                        />
                      )}
                    </div>
                    <div>
                      {'Found a bug or have feedback? '}
                      <a href={`mailto:${SupportEmail}`}>Email support</a>
                      {', open an issue on '}
                      <a href={GitHubLink}>GitHub</a>
                      {' or post in our #bug-reports channel on '}
                      <a href="https://discord.gg/jyxpUSe">Discord</a>.
                    </div>
                  </div>
                  <div>
                    <Tooltip tooltip="Hide" placement="left" delayShow={500}>
                      <a
                        className="close-banner"
                        href="#"
                        onClick={e => this.onHide(e)}
                        children="×"
                      />
                    </Tooltip>
                  </div>
                </div>
              </div>
            </>
          )
        }}
      </Query>
    )
  }

  onHide(e) {
    e.preventDefault()
    store.set('hide-beta-banner', true)
    this.setState({ hideBanner: true })
  }
}

export default BetaBanner

require('react-styl')(`
  .beta-banner
    background: #fff8de
    font-size: 18px
    font-weight: normal
    border-bottom: 1px solid var(--dusk)
    &.sm
      padding: 0.375rem 0.5rem
      font-size: 14px
      font-weight: bold
      line-height: 1
      .container
        padding-right: 0
      .badge
        margin-right: 0.5rem
        padding: 0.2rem 0.25rem
      > a
        padding: 0 0.25rem
        color: #000
        display: block
        margin-left: auto
    &.lg .container
      padding-top: 0.75rem
      padding-bottom: 0.75rem
    .container
      > div:nth-child(1)
        margin-right: 1rem
      > div:nth-child(2)
        flex: 1
        > div:nth-child(1)
          font-weight: 700
      a.close-banner
        display: inline-block
        margin-left: auto
        width: 1.5rem
        line-height: 1.5rem
        text-align: center
        border-radius: 1rem
        font-weight: 700
        color: var(--dark)
        &:hover
          background: gray
          color: white;
`)
