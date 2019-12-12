import React from 'react'
import { fbt } from 'fbt-runtime'
import withIsMobile from 'hoc/withIsMobile'
import MobileModal from 'components/MobileModal'
import Link from 'components/Link'

const UserProfileCreated = ({ onCompleted, isMobile, referralReward }) => {
  const content = (
    <div className="profile-created">
      <img src="images/identity/rocket.svg" />
      {referralReward ? (
        <div className="rewards-earned mt-3">
          <div>
            <fbt desc="UserActivation.congratulations">Congratulations!</fbt>
          </div>
          <div>
            <fbt desc="UserActivation.youEarned">You earned</fbt>
          </div>
          <div className="partner-referral-reward mt-2">{referralReward}</div>
        </div>
      ) : (
        <>
          <h2 className="mt-3">
            <fbt desc="UserActivation.congratulations">Congratulations!</fbt>
          </h2>
          <div>
            <fbt desc="UserActivation.profileCreated">
              You&apos;ve successfully created your profile You&apos;re now
              ready to continue your journey in the Origin Marketplace.
            </fbt>
          </div>
        </>
      )}
      <div className="actions mt-auto">
        {referralReward ? (
          <>
            <Link
              to="/campaigns"
              className="btn btn-primary btn-rounded mt-5 mb-3 mx-md-3"
            >
              <fbt desc="UserActivation.earnMore">Earn more OGN</fbt>
            </Link>
          </>
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
    .rewards-earned
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
