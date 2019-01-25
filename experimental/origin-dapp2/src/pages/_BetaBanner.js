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
    hide: store.get('hide-beta', false)
  }
  render() {
    if (this.state.hide) {
      return null
    }
    return (
      <Query query={NetworkQuery}>
        {({ data }) => {
          const networkName = get(data, 'web3.networkName', '')
          return (
            <div className="beta-banner">
              <div className="container d-flex align-items-center">
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
                    <a
                      href="#"
                      onClick={e => {
                        e.preventDefault()
                        store.set('hide-beta', true)
                        this.setState({ hide: true })
                      }}
                      children="×"
                    />
                  </Tooltip>
                </div>
              </div>
            </div>
          )
        }}
      </Query>
    )
  }
}

export default BetaBanner

require('react-styl')(`
  .beta-banner
    background: #fff8de
    font-size: 18px
    font-weight: normal
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
          width: 1.5rem;
          line-height: 1.5rem;
          text-align: center;
          border-radius: 1rem;
          font-weight: 700;
          color: var(--dark)
          &:hover
            background: gray;
            color: white;

`)
