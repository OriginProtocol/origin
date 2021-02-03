import React, { useContext, useState } from 'react'
import get from 'lodash.get'

import { DataContext } from '@/providers/data'
import BorderedCard from '@/components/BorderedCard'
import GoogleAuthenticatorIcon from '@/assets/google-authenticator.svg'
import AccountTable from '@/components/AccountTable'
import SessionTable from '@/components/SessionTable'
import OtpModal from '@/components/OtpModal'

const Security = ({ user }) => {
  const data = useContext(DataContext)
  const [displayOtpModal, setDisplayOtpModal] = useState(false)

  return (
    <>
      <h1>Security</h1>
      <div className="row mb-4">
        <div className="col-xs-12 col-lg-6 mb-4">
          <BorderedCard>
            <div className="row">
              <div className="col-md-10">
                <strong style={{ fontSize: '18px' }}>
                  {get(user, 'email')}
                </strong>
              </div>
              <div className="col-md-2 text-md-right">
                <a
                  href="mailto:investor-relations@originprotocol.com?subject=Change Investor Email"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Change
                </a>
              </div>
            </div>
          </BorderedCard>
        </div>

        <div className="col-xs-12 col-lg-6 mb-4">
          <BorderedCard>
            <div className="row">
              <div
                className="d-none d-md-block col-2"
                style={{
                  marginTop: '-20px',
                  marginBottom: '-20px',
                  maxHeight: '60px'
                }}
              >
                <GoogleAuthenticatorIcon width="100%" height="100%" />
              </div>
              <div className="col-md-8">
                <strong style={{ fontSize: '18px' }}>2FA</strong>
              </div>
              <div className="col-md-2 text-md-right">
                <a
                  href=""
                  onClick={e => {
                    e.preventDefault()
                    setDisplayOtpModal(true)
                  }}
                >
                  Change
                </a>
              </div>
            </div>
          </BorderedCard>
        </div>
      </div>

      <div className="mb-4">
        <AccountTable accounts={data.accounts} />
      </div>

      <div className="mb-4">
        <SessionTable />
      </div>

      {displayOtpModal && (
        <OtpModal onModalClose={() => setDisplayOtpModal(false)} />
      )}
    </>
  )
}

export default Security
