import React from 'react'
import { connect } from 'react-redux'

import GrantRow from './GrantRow'
import TransferDialog from './TransferDialog'

function GrantsTable(props) {
  return (
    <div>
      <TransferDialog />
      <table className="bp3-html-table bp3-html-table-bordered bp3-html-table-striped">
        <thead>
          <tr>
            <th>Grant date</th>
            <th>Amount</th>
            <th>Vesting cliff</th>
            <th>Vesting period</th>
            <th>Next vesting event</th>
            <th>Vested</th>
            <th>
              Previously
              <br />
              transferred
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {props.grants.map(grant => (
            <GrantRow grant={grant} key={grant.id} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

const mapStateToProps = state => {
  return {
    grants: state.grants
  }
}

export default connect(mapStateToProps)(GrantsTable)
