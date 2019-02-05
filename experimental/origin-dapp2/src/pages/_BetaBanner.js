import React, { Component } from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'

import Store from 'utils/store'
import NetworkQuery from 'queries/Network'
import Tooltip from 'components/Tooltip'

const store = Store('sessionStorage')
const GitHubLink = 'https://github.com/OriginProtocol/origin-dapp/issues/new'

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
              <div className="beta-banner sm align-items-center d-flex d-sm-none">
                <div className="badge badge-primary">Beta</div>
                Welcome to the Origin Beta!
                <a href="#" onClick={e => this.onHide(e)} children="×" />
              </div>
              <div className="beta-banner d-none d-sm-block">
                <div className="container align-items-center d-flex">
                  <div className="badge badge-primary">Beta</div>
                  <div>
                    <div>
                      You&apos;re currently using the Origin {networkName} Beta.
                    </div>
                    <div>
                      {'Found a bug? Open an issue on '}
                      <a href={GitHubLink}>GitHub</a>
                      {' or report it in our #bug-reports channel on '}
                      <a href="https://discord.gg/jyxpUSe">Discord</a>.
                    </div>
                  </div>
                  <div>
                    <Tooltip tooltip="Hide" placement="left" delayShow={500}>
                      <a href="#" onClick={e => this.onHide(e)} children="×" />
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
    &.sm
      padding: 0.375rem 0.5rem
      font-size: 14px
      font-weight: bold
      .badge
        margin-right: 0.5rem
        padding: 0.2rem 0.25rem
      > a
        padding: 0 0.25rem
        color: #000
        display: block
        margin-left: auto
    .container
      padding-top: 0.75rem
      padding-bottom: 0.75rem
      > div:nth-child(1)
        margin-right: 1rem
      > div:nth-child(2)
        flex: 1
        > div:nth-child(1)
          font-weight: 700
      > div:nth-child(3)
        a
          display: inline-block
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
