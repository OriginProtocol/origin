import React from 'react'
import { fbt } from 'fbt-runtime'

import Avatar from 'components/Avatar'
import Balances from 'components/Balances'
import UserActivationLink from 'components/UserActivationLink'

const CreateIdentity = ({ id, onClose, isMobileApp }) => (
  <>
    <div className="create-identity text-center">
      <Avatar />
      <p>
        <fbt desc="nav.profile.noProfile">No profile created</fbt>
      </p>

      <UserActivationLink
        className="btn btn-primary"
        onClose={onClose}
        onClick={onClose}
      >
        <span>
          <fbt desc="nav.profile.createAProfile">Create a Profile</fbt>
        </span>
      </UserActivationLink>

      {!isMobileApp && (
        <Balances
          account={id}
          onClose={onClose}
          title={<fbt desc="nav.profile.walletBalance">Wallet balances</fbt>}
          className="pt-3 pb-3"
        />
      )}
    </div>
  </>
)

export default CreateIdentity

require('react-styl')(`
  .create-identity
    margin-top: 3rem
    display: flex
    flex-direction: column
    align-items: center
    flex: 1
    h3
      padding: 0.5rem 0
      margin-bottom: 0.5rem
      font-family: var(--default-font)
      font-weight: bold
      color: #000
      font-size: 22px
      line-height: normal
    .btn
      border-radius: 2rem
      padding: 0.5rem 2rem
      margin-bottom: 2rem
      font-size: 1.125rem
    p
      font-size: 1.125rem
      margin-top: 1.75rem
      margin-bottom: 1.75rem
      color: #0d1d29
      line-height: normal
    .balances
      border-top: 1px solid #dde6ea
      width: 100%
    .strength
      margin: 0.25rem 0 1.5rem 0
`)
