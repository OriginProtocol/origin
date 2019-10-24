import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import { Doughnut } from 'react-chartjs-2'
import Dropdown from 'react-bootstrap/Dropdown'

import BonusModal from '@/components/BonusModal'
import BorderedCard from '@/components/BorderedCard'
import DropdownDotsToggle from '@/components/DropdownDotsToggle'
import WithdrawModal from '@/components/WithdrawModal'

class BalanceCard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      displayBonusModal: false,
      displayWithdrawModal: false,
      redirectTo: null
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
    if (this.state.redirectTo) {
      return <Redirect to={this.state.redirectTo} />
    }

    return (
      <>
        {this.state.displayWithdrawModal && (
          <WithdrawModal
            accounts={this.props.accounts}
            isLocked={this.props.isLocked}
          />
        )}

        {this.state.displayBonusModal && <BonusModal />}

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
                  <Dropdown drop={'left'} style={{ display: 'inline' }}>
                    <Dropdown.Toggle
                      as={DropdownDotsToggle}
                      id="available-dropdown"
                    ></Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item
                        onClick={() =>
                          this.setState({ displayBonusModal: true })
                        }
                      >
                        Earn Bonus Tokens
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() =>
                          this.setState({ displayWithdrawModal: true })
                        }
                      >
                        Withdraw
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() =>
                          this.setState({ redirectTo: '/withdrawal' })
                        }
                      >
                        Withdrawal History
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </div>
              <div className="row" style={{ fontSize: '24px' }}>
                <div className="col">
                  <div className="status-circle status-circle-info mr-3"></div>
                  Bonus Locked Tokens
                </div>
                <div className="col-5 text-right">
                  <strong>
                    {this.props.lockedBalance}{' '}
                    <small className="ogn">OGN</small>
                  </strong>
                  <Dropdown drop={'left'} style={{ display: 'inline' }}>
                    <Dropdown.Toggle
                      as={DropdownDotsToggle}
                      id="bonus-dropdown"
                    ></Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item
                        onClick={() =>
                          this.setState({ displayBonusModal: true })
                        }
                      >
                        Earn Bonus Tokens
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => this.setState({ redirectTo: '/bonus' })}
                      >
                        View Details
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
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
