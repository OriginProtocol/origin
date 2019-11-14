import React, { useState } from 'react'
import { Redirect } from 'react-router-dom'
import { Doughnut } from 'react-chartjs-2'
import Dropdown from 'react-bootstrap/Dropdown'
import moment from 'moment'

import { earnOgnEnabled } from '@/constants'
import BonusModal from '@/components/BonusModal'
import BorderedCard from '@/components/BorderedCard'
import DropdownDotsToggle from '@/components/DropdownDotsToggle'
import WithdrawModal from '@/components/WithdrawModal'

const BalanceCard = props => {
  const [displayBonusModal, setDisplayBonusModal] = useState(false)
  const [displayWithdrawModal, setDisplayWithdrawModal] = useState(false)
  const [redirectTo, setRedirectTo] = useState(false)

  const doughnutData = () => {
    return {
      labels: ['Available', 'Locked'],
      datasets: [
        {
          data: [Number(props.balance), Number(props.locked)],
          backgroundColor: ['#00db8d', '#007cff'],
          borderWidth: 0
        }
      ]
    }
  }

  if (redirectTo) {
    return <Redirect push to={redirectTo} />
  }

  if (props.isLocked) {
    const now = moment.utc()
    return (
      <BorderedCard shadowed={true}>
        <div className="row">
          {moment.isMoment(props.unlockDate) ? (
            <>
              <div className="col-12 col-lg-6 my-4">
                <h1 className="mb-1">Your tokens are almost here!</h1>
                <span style={{ fontSize: '18px' }}>
                  Your first tokens will be available in...
                </span>
              </div>
              <div className="col-12 col-lg-6" style={{ alignSelf: 'center' }}>
                <div className="bluebox p-2 text-center">
                  {props.unlockDate.diff(now, 'days')}d{' '}
                  {props.unlockDate.diff(now, 'hours') % 24}h{' '}
                  {props.unlockDate.diff(now, 'minutes') % 60}m
                </div>
              </div>
            </>
          ) : (
            <div className="col">
              <div className="bluebox p-2 text-center">Coming Soon</div>
            </div>
          )}
        </div>
      </BorderedCard>
    )
  }

  return (
    <>
      {displayWithdrawModal && (
        <WithdrawModal
          balance={props.balance}
          accounts={props.accounts}
          isLocked={props.isLocked}
          onModalClose={() => setDisplayWithdrawModal(false)}
        />
      )}

      {displayBonusModal && (
        <BonusModal
          balance={props.balance}
          onModalClose={() => setDisplayBonusModal(false)}
        />
      )}

      <BorderedCard shadowed={true}>
        <div className="row header mb-3">
          <div className="col">
            <h2>My Vested Tokens</h2>
          </div>
        </div>
        <div className="row">
          {earnOgnEnabled && (props.balance > 0 || props.locked > 0) && (
            <div
              className="col-12 col-lg-4 col-xl-1 mb-3 mb-lg-0"
              style={{ minWidth: '200px' }}
            >
              <div style={{ position: 'relative' }}>
                <Doughnut
                  data={doughnutData}
                  options={{ cutoutPercentage: 60 }}
                  legend={{ display: false }}
                />
              </div>
            </div>
          )}
          <div className="col" style={{ alignSelf: 'center' }}>
            <div className="row mb-2" style={{ fontSize: '24px' }}>
              <div className="col">
                <div className="status-circle status-circle-success mr-3"></div>
                Available
              </div>
              <div className="col-5 text-right">
                <strong>
                  {props.isLocked ? 0 : Number(props.balance).toLocaleString()}{' '}
                  <small className="ogn">OGN</small>
                </strong>
                <Dropdown drop={'left'} style={{ display: 'inline' }}>
                  <Dropdown.Toggle
                    as={DropdownDotsToggle}
                    id="available-dropdown"
                  ></Dropdown.Toggle>

                  <Dropdown.Menu>
                    {earnOgnEnabled && (
                      <Dropdown.Item onClick={() => setDisplayBonusModal(true)}>
                        Earn Bonus Tokens
                      </Dropdown.Item>
                    )}
                    <Dropdown.Item
                      onClick={() => setDisplayWithdrawModal(true)}
                    >
                      Withdraw
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => setRedirectTo('/withdrawal')}>
                      Withdrawal History
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>
            {earnOgnEnabled && (
              <div className="row" style={{ fontSize: '24px' }}>
                <div className="col">
                  <div className="status-circle status-circle-info mr-3"></div>
                  Locked Tokens
                </div>
                <div className="col-5 text-right">
                  <strong>
                    {props.locked} <small className="ogn">OGN</small>
                  </strong>
                  <Dropdown drop={'left'} style={{ display: 'inline' }}>
                    <Dropdown.Toggle
                      as={DropdownDotsToggle}
                      id="bonus-dropdown"
                    ></Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => setDisplayBonusModal(true)}>
                        Earn Bonus Tokens
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => setRedirectTo('/lockup')}>
                        View Details
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </div>
            )}
          </div>
        </div>
      </BorderedCard>
    </>
  )
}

export default BalanceCard
