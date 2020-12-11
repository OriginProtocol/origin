import React, { useContext, useState } from 'react'
import get from 'lodash.get'

import { getNextVest } from '@origin/token-transfer-server/src/shared'

import { DataContext } from '@/providers/data'
import BalanceCard from '@/components/BalanceCard'
import NewsHeadlinesCard from '@/components/NewsHeadlinesCard'
import VestingCard from '@/components/VestingCard'
import GrantDetailCard from '@/components/GrantDetailCard'
import WithdrawalSummaryCard from '@/components/WithdrawalSummaryCard'
import BonusCard from '@/components/BonusCard'
import StakeModal from '@/components/StakeModal'
import WithdrawModal from '@/components/WithdrawModal'
import OtcRequestModal from '@/components/OtcRequestModal'
import StakeBanner from '@/components/StakeBanner'

const Dashboard = props => {
  const data = useContext(DataContext)

  const [displayStakeModal, setDisplayStakeModal] = useState(false)
  const [displayWithdrawModal, setDisplayWithdrawModal] = useState(false)
  const [displayOtcRequestModal, setDisplayOtcRequestModal] = useState(false)

  const isEmployee = !!get(props.user, 'employee')
  const nextVest = getNextVest(data.grants, props.user)
  const hasLockups = data.lockups.length > 0
  const displayLockupCta = nextVest && !data.config.isLocked
  const displayFullWidthLockupCta = displayLockupCta && hasLockups

  const renderModals = () => (
    <>
      {displayStakeModal && (
        <StakeModal onModalClose={() => setDisplayStakeModal(false)} />
      )}
      {displayWithdrawModal && (
        <WithdrawModal
          displayLockupCta={false} // For future use
          onCreateOtcRequest={() => {
            setDisplayWithdrawModal(false)
            setDisplayOtcRequestModal(true)
          }}
          nextVest={nextVest}
          onCreateLockup={() => {
            setDisplayWithdrawModal(false)
            setDisplayStakeModal(true)
          }}
          onModalClose={() => setDisplayWithdrawModal(false)}
        />
      )}
      {displayOtcRequestModal && (
        <OtcRequestModal
          onModalClose={() => setDisplayOtcRequestModal(false)}
        />
      )}
    </>
  )

  return (
    <>
      {renderModals()}
      {displayFullWidthLockupCta && <StakeBanner fullWidth={true} />}
      <div className="row small-gutter">
        <div className={`${data.config.isLocked ? 'col-12' : 'col'} mb-10`}>
          <BalanceCard
            onDisplayBonusModal={() => setDisplayStakeModal(true)}
            onDisplayWithdrawModal={() => setDisplayWithdrawModal(true)}
          />
        </div>

        {displayLockupCta && !displayFullWidthLockupCta && (
          <div className="col mb-10">
            <StakeBanner />
          </div>
        )}
        {hasLockups && (
          <div className="col mb-10">
            <BonusCard onDisplayBonusModal={() => setDisplayStakeModal(true)} />
          </div>
        )}
      </div>
      <div className="row small-gutter">
        <div className="col col-xl-6 mb-10">
          <VestingCard user={props.user} isEmployee={isEmployee} />
        </div>
        <div className="col col-xl-6">
          <div className="mb-10">
            <WithdrawalSummaryCard
              onDisplayWithdrawModal={() => setDisplayWithdrawModal(true)}
            />
          </div>
          <div className="mb-10">
            <NewsHeadlinesCard />
          </div>
          {!isEmployee && (
            <div className="mb-10">
              <GrantDetailCard user={props.user} />
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Dashboard
