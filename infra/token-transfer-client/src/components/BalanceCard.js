import React, { Component } from 'react'
import { Doughnut } from 'react-chartjs-2'

import BorderedCard from '@/components/BorderedCard'
import WithdrawModal from '@/components/WithdrawModal'

class BalanceCard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      displayWithdrawModal: false
    }
  }

  doughnutData = () => {
    return {
      labels: ['Available', 'Locked'],
      datasets: [
        {
          data: [Number(this.props.balance), 0],
          backgroundColor: ['#00db8d', '#007cff'],
          borderWidth: 0
        }
      ]
    }
  }

  render() {
    return (
      <>
        {this.state.displayModal && <WithdrawModal />}

        <BorderedCard shadowed={true}>
          <div className="row header mb-3">
            <div className="col">
              <h2>My Vested Tokens</h2>
            </div>
          </div>
          <div className="row">
            <div
              className="col-12 col-lg-4 col-xl-1 mb-3 mb-lg-0"
              style={{ minWidth: '200px' }}
            >
              <div style={{ position: 'relative', height: '100%' }}>
                <Doughnut
                  data={this.doughnutData}
                  options={{ cutoutPercentage: 60 }}
                  legend={{ display: false }}
                />
              </div>
            </div>
            <div className="col" style={{ alignSelf: 'center' }}>
              <div className="row mb-2" style={{ fontSize: '24px' }}>
                <div className="col">
                  <div className="status-circle status-circle-success mr-3"></div>
                  Available
                </div>
                <div className="col-5 text-right">
                  <strong>
                    {this.props.isLocked
                      ? 0
                      : Number(this.props.balance).toLocaleString()}{' '}
                    <small className="ogn">OGN</small>
                  </strong>
                  <span
                    className="ml-2"
                    style={{ fontWeight: 900, color: '#bdcbd5' }}
                  >
                    &#8942;
                  </span>
                </div>
              </div>
              <div className="row" style={{ fontSize: '24px' }}>
                <div className="col">
                  <div className="status-circle status-circle-info mr-3"></div>
                  Bonus Locked Tokens
                </div>
                <div className="col-5 text-right">
                  <strong>
                    0 <small className="ogn">OGN</small>
                  </strong>
                  <span
                    className="ml-2"
                    style={{ fontWeight: 900, color: '#bdcbd5' }}
                  >
                    &#8942;
                  </span>
                </div>
              </div>
            </div>
          </div>
        </BorderedCard>
      </>
    )
  }
}

export default BalanceCard
