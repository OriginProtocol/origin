import React, { Component } from 'react'

const data = [
  {
    title: 'Placed Offer',
    hash: '0xb88e6f42c44d5be6f42c4',
    date: 'Nov. 7, 2018 11:54AM'
  }
]

class TxHistory extends Component {
  state = {}
  render() {
    return (
      <table className="tx-history table table-sm table-striped table-hover">
        <thead>
          <tr>
            <th>TxName</th>
            <th>Date</th>
            <th className="expand" />
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              className={this.state[`row${idx}`] ? 'active' : ''}
              key={idx}
              onClick={() =>
                this.setState({
                  [`row${idx}`]: this.state[`row${idx}`] ? false : true
                })
              }
            >
              <td>
                <div className="tx">
                  <i />
                  {row.title}
                  <div className="info">
                    Tx Hash: <a href="#">{row.hash}</a>
                  </div>
                </div>
              </td>
              <td>{row.date}</td>
              <td>
                <i className="caret" />
              </td>
            </tr>
          ))}
        </tbody>
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
      .tx
        padding-left: 2rem
        position: relative
        .info
          display: none
          margin-top: 0.5rem
        i
          position: absolute
          left: 0
          top: 1px
          background: var(--greenblue) url(images/checkmark.svg) center no-repeat;
          background-size: 0.75rem;
          border-radius: 2rem;
          width: 1.2rem;
          height: 1.2rem;
          display: inline-block;

      .caret
        background: url(images/caret-dark.svg) center no-repeat;
        width: 1rem;
        height: 1rem;
        display: inline-block;
        transform: rotate(90deg)
        vertical-align: -2px
      tr.active
        .info
          display: block
        .caret
          transform: rotate(270deg)


    &.table-striped tbody tr:nth-of-type(odd)
      background-color: var(--pale-grey-eight)
`)
