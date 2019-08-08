import React from 'react'

import BorderedCard from '@/components/BorderedCard'

const BalanceCard = props => (
  <BorderedCard shadowed={true}>
    <div className="row header">
      <div className="col-8">
        <h2>Available Balance</h2>
      </div>
      <div className="col-4 link">
        <a href="#">View details</a>
      </div>
    </div>
    <div className="balance">
      {Number(props.balance).toLocaleString()} <span className="ogn">OGN</span>
    </div>
    <div>
      <button className="btn btn-primary btn-lg">Withdraw</button>
    </div>
    <small>You will need an Ethereum wallet to withdraw OGN</small>
  </BorderedCard>
)

export default BalanceCard

require('react-styl')(`
  .balance
    font-size: 40px
    font-weight: bold;
  .ogn
    font-size: 20px
    color: #007cff
`)
