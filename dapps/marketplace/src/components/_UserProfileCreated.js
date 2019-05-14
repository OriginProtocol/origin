import React from 'react'
import { fbt } from 'fbt-runtime'
import Link from './Link'

const UserProfileCreated = ({ onCompleted }) => (
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
    <div className="info white mt-6 mb-3">
      <div className="image">
        <img src="images/blue-coins.svg" />
      </div>
      <div className="content">
        <div className="title">
          <fbt desc="UserActivation.earnOgnTokens">Earn OGN Tokens</fbt>
        </div>
        <fbt desc="UserActivation.completeTasks">
          Complete tasks and earn tokens.
        </fbt>
        <div>
          <Link to="/welcome" target="_blank">
            <fbt desc="learnMore">Learn More &gt;</fbt>
          </Link>
        </div>
      </div>
    </div>
    <div className="actions">
      <button
        type="button"
        onClick={e => {
          e.preventDefault()
          if (onCompleted) {
            onCompleted()
          }
        }}
        className="btn btn-primary mt-3 mb-3"
        children={fbt('Ok', 'Ok')}
      />
    </div>
  </div>
)

export default UserProfileCreated

require('react-styl')(`
  .profile-created
    text-align: center
`)
