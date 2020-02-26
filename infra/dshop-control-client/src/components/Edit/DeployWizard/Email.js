import React, { useState } from 'react'

import store from '@/store'

const Email = () => {
  const [email, setEmail] = useState('')

  const handleSubmit = () => {
    store.update(s => {
      s.backend = {
        ...s.backend,
        email
      }
    })
  }

  return (
    <>
      <div className="my-5">
        <p>
          Great! You&apos;ve elected to use Origin&apos;s hosted backend to
          deliver email notifications and manage orders and discounts (if
          you&apos;d prefer to host it yourself, please refer to the
          documentation).
        </p>

        <p>
          Please enter the email address you&apos;d like to use for DShop
          related notifications. If we find you&apos;ve already got an account,
          we&apos;ll use that, otherwise we&apos;ll create one for you.
        </p>
      </div>

      <div className="row">
        <div className="col-12 col-md-6">
          <div className="card p-5">
            <form className="mt-3" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email</label>
                <input
                  className="form-control input-lg"
                  onChange={e => setEmail(e.target.value)}
                  value={email}
                  placeholder="Email address"
                />
              </div>
              <div className="mt-5">
                <button type="submit" className="btn btn-lg btn-primary">
                  Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default Email
