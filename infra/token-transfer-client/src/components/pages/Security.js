import React, { useContext } from 'react'
import get from 'lodash.get'

import { DataContext } from '@/providers/data'
import BorderedCard from '@/components/BorderedCard'
import GoogleAuthenticatorIcon from '@/assets/google-authenticator.svg'
import AccountTable from '@/components/AccountTable'
import SessionTable from '@/components/SessionTable'

const Security = ({ user }) => {
  const data = useContext(DataContext)

  return (
    <>
      <h1>Security</h1>
      <div className="row mb-4">
        <div className="col-xs-12 col-lg-6 mb-4">
          <BorderedCard>
            <div className="row">
              <div className="col-xl-6">
                <strong style={{ fontSize: '18px' }}>
                  {get(user, 'email')}
                </strong>
              </div>
              <div className="col-xl-6 text-xl-right">
                <a
                  href="mailto:investor-relations@originprotocol.com?subject=Change Investor Email"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Change Email
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
                <strong style={{ fontSize: '18px' }}>
                  Google Authenticator
                </strong>
              </div>
              <div className="col-md-2 text-md-right">
                <a href="mailto:investor-relations@originprotocol.com?subject=Help with Google Authenticator">
                  Help
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
    </>
  )
}

export default Security
