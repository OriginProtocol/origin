import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button } from '@blueprintjs/core'
import moment from 'moment'

import { setTransferDialogGrant, setTransferDialogOpen } from '../actions'

class GrantRow extends Component {
  handleTransferClicked = (grant) => {
    this.props.setTransferDialogGrant(grant)
    this.props.setTransferDialogOpen(true)
  }

  render() {
    const grant = this.props.grant
    const grantDate = moment(grant.grantedAt).format('YYYY-MM-DD')
    const cliffDate = moment(grantDate, 'YYYY-MM-DD')
      .add(grant.cliffMonths, 'M')
      .format('YYYY-MM-DD')
    const vestYears = grant.totalMonths / 12
    const transferrable = grant.vested - grant.transferred
    const onTransferClicked = () => this.handleTransferClicked(grant)
    const transferButton = transferrable > 0
      ? <Button className="bp3-intent-success" onClick={onTransferClicked}>
          Transfer up to {transferrable.toLocaleString()} OGN
        </Button>
      : null
    let nextVest
    if (grant.nextVest) {
      const nextVestDate = moment(grant.nextVest.date).format('YYYY-MM-DD')
      const amount = grant.nextVest.amount.toFixed(2)
      nextVest = `${amount} OGN on ${nextVestDate}`
    } else {
      nextVest = 'Fully vested'
    }

    return (
      <tr>
        <td>{grantDate}</td>
        <td>{grant.amount.toLocaleString()} OGN</td>
        <td>{cliffDate}</td>
        <td>{vestYears} years</td>
        <td>{nextVest}</td>
        <td>{grant.vested.toLocaleString()}</td>
        <td>{grant.transferred.toLocaleString()}</td>
        <td>{transferButton}</td>
      </tr>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setTransferDialogGrant: grant => dispatch(setTransferDialogGrant(grant)),
    setTransferDialogOpen: open => dispatch(setTransferDialogOpen(open))
  }
}

export default connect(null, mapDispatchToProps)(GrantRow)
