import React from 'react'
import { fbt } from 'fbt-runtime'
import withIsMobile from 'hoc/withIsMobile'
import MobileModal from 'components/MobileModal'
import Link from 'components/Link'

const UserProfileCreated = ({
  onCompleted,
  isMobile,
  enrolled,
  referralReward
}) => {
  const content = (
    <div className="profile-created">
      <img src="images/identity/rocket.svg" />
      {enrolled && (
        <div className="mt-3">
          <div>
            <fbt desc="UserActivation.congratulations">Congratulations!</fbt>
          </div>
          {enrolled ? (
            <>
              <div>
                {referralReward ? (
                  <fbt desc="UserActivation.profileCreatedCollect">
                    You&apos;ve successfully created your profile. You&apos;re
                    now ready to collect your Origin Tokens.
                  </fbt>
                ) : (
                  <fbt desc="UserActivation.profileCreatedEarn">
                    You&apos;ve successfully created your profile. You&apos;re
                    now ready to start earning Origin Rewards.
                  </fbt>
                )}
              </div>
              <div className="partner-referral-reward mt-2">
                {referralReward}
              </div>
            </>
          ) : (
            <div>
              <fbt desc="UserActivation.profileCreatedJourney">
                You&apos;ve successfully created your profile. You&apos;re now
                ready to continue your journey in the Origin Marketplace.
              </fbt>
            </div>
          )}
        </div>
      )}
      <div className="actions mt-auto">
        {referralReward ? (
          <Link
            to="/campaigns"
            className="btn btn-primary btn-rounded mt-5 mb-3 mx-md-3"
          >
            <fbt desc="UserActivation.collectOGN">Collect OGN</fbt>
          </Link>
        ) : enrolled ? (
          <Link
            to="/campaigns"
            className="btn btn-primary btn-rounded mt-5 mb-3 mx-md-3"
          >
            <fbt desc="UserActivation.earnOGN">Earn OGN</fbt>
          </Link>
        ) : (
          <button
            type="button"
            onClick={e => {
              e.preventDefault()
              if (onCompleted) {
                onCompleted()
              }
            }}
            className="btn btn-primary btn-rounded mt-5 mb-3"
            children={fbt('Ok', 'Ok')}
          />
        )}
      </div>
    </div>
  )

  if (isMobile) {
    return <MobileModal>{content}</MobileModal>
  }

  return content
}

export default withIsMobile(UserProfileCreated)

require('react-styl')(`
  .profile-created
    height: 100%
    display: flex
    padding: 1rem
    flex-direction: column
    text-align: center
    > img
      margin-top: 2.5rem
    .actions .btn
      width: 50%
    .partner-referral-reward
      font-family: Poppins
      font-size: 1.5rem
      font-weight: 500
      color: var(--dark)
  .btn-dark
    background-color: #0d1d29
  .modal-content
    .profile-created
      .actions
        .btn
          width: 100%
          padding: 0.5rem
`)
