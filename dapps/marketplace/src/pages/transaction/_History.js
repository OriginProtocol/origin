import React, { Component } from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'
import dayjs from 'dayjs'
import { fbt } from 'fbt-runtime'

import query from 'queries/OfferEvents'
import QueryError from 'components/QueryError'
import TxHash from './_TxHash'

const date = timestamp => dayjs.unix(timestamp).format('MMM. D, YYYY h:mmA')
const eventName = name => {
  if (name === 'OfferCreated') return 'Offer Made'
  const [, , target] = name.split(/(Offer|Listing)/)
  return target
}

class TxHistory extends Component {
  state = {}
  render() {
    const offerId = this.props.offer.id

    const trProps = (idx, info) => ({
      className: `${info ? 'info' : ''}${
        this.state[`row${idx}`] ? ' active' : ''
      }${idx % 2 === 1 ? '' : ' odd'}`,
      onClick: () =>
        this.setState({
          [`row${idx}`]: this.state[`row${idx}`] ? false : true
        })
    })
    const vars = { offerId }

    return (
      <table className="tx-history table table-sm">
        <thead>
          <tr>
            <th><fbt desc="History.txName">TxName</fbt></th>
            <th><fbt desc="History.date">Date</fbt></th>
            <th className="expand" />
          </tr>
        </thead>
        <Query query={query} variables={vars}>
          {({ loading, error, data }) => {
            const history = get(data, 'marketplace.offer.history', [])
            if (error) {
              return <QueryError error={error} query={query} vars={vars} />
            } else if (loading || !history.length) {
              return null
            }

            return (
              <tbody>
                {history.map((item, idx) => (
                  <React.Fragment key={idx}>
                    <tr {...trProps(idx)}>
                      <td>
                        <div className="tx">
                          <i />
                          {eventName(item.event.event)}
                        </div>
                      </td>
                      <td>{date(item.event.block.timestamp)}</td>
                      <td>
                        <i className="caret" />
                      </td>
                    </tr>
                    {!this.state[`row${idx}`] ? null : (
                      <tr {...trProps(idx, true)}>
                        <td colSpan={3} className="info">
                          <div>
                            <fbt desc="History.ipfsHash">IPFS Hash</fbt>:
                            <a
                              onClick={e => e.stopPropagation()}
                              target="_blank"
                              rel="noopener noreferrer"
                              href={item.ipfsUrl}
                              children={item.ipfsHash}
                            />
                          </div>
                          <div>
                            <fbt desc="History.txHash">Tx Hash</fbt>: <TxHash hash={item.id} />
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            )
          }}
        </Query>
      </table>
    )
  }
}

export default TxHistory

require('react-styl')(`
  .tx-history
    margin-bottom: 2.5rem
    thead
      th
        color: var(--dusk)
        font-size: 14px
        border-top: 1px solid var(--pale-grey-two)
        padding-top: 0.25rem
        padding-bottom: 0.25rem
        &.expand
          width: 3rem
    tbody
      font-weight: normal
      tr
        cursor: pointer
        &.active .caret
          transform: rotate(270deg)
        &.odd td
          background-color: var(--pale-grey-eight)

      .tx
        padding-left: 2rem
        position: relative
        i
          position: absolute
          left: 0
          top: 1px
          background: var(--greenblue) url(images/checkmark.svg) center no-repeat
          background-size: 0.75rem
          border-radius: 2rem
          width: 1.2rem
          height: 1.2rem
          display: inline-block
      .info
        padding-left: 2.8rem
        padding-top: 0
        overflow: hidden
        a
          margin-left: 0.5rem
        > div
          overflow: hidden
          text-overflow: ellipsis

      .caret
        background: url(images/caret-dark.svg) center no-repeat
        width: 1rem
        height: 1rem
        display: inline-block
        transform: rotate(90deg)
        vertical-align: -2px
`)
