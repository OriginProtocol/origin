import React from 'react'
import { fbt } from 'fbt-runtime'
import withIsMobile from 'hoc/withIsMobile'
import MobileModal from 'components/MobileModal'

const UserProfileCreated = ({ onCompleted, isMobile }) => {
  const content = (
    <div className="profile-created">
      <img src="images/identity/rocket.svg" />
      <h2 className="mt-3">
        <fbt desc="UserActivation.congratulations">Congratulations</fbt>
      </h2>
      <div>
        <fbt desc="UserActivation.profileCreated">
          You&apos;ve successfully created your profile You&apos;re now ready to
          continue your journey in the Origin Marketplace.
        </fbt>
      </div>
      <div className="actions mt-auto">
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
    .actions button
      width: 50%
  .modal-content
    .profile-created
      .actions
        button
          width: 100%
`)
