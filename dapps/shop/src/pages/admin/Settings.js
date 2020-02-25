import React, { useState, useEffect } from 'react'

import { formInput, formFeedback } from 'utils/formHelpers'
import useConfig from 'utils/useConfig'
import useShopConfig from 'utils/useShopConfig'

const { BACKEND_AUTH_TOKEN } = process.env

function validate(state) {
  const newState = {}

  if (!state.dataUrl) {
    newState.dataUrlError = 'Enter a data URL'
  }

  const valid = Object.keys(newState).every(f => f.indexOf('Error') < 0)

  return { valid, newState: { ...state, ...newState } }
}

const defaultValues = {
  dataUrl: '',
  publicUrl: '',
  printful: '',
  stripeBackend: '',
  stripeWebhookSecret: '',
  pgpPublicKey: '',
  pgpPrivateKey: '',
  pgpPrivateKeyPass: ''
}

const AdminSettings = () => {
  const { config } = useConfig()
  const { shopConfig } = useShopConfig()
  const [state, setStateRaw] = useState(defaultValues)
  const setState = newState => setStateRaw({ ...state, ...newState })

  useEffect(() => {
    if (shopConfig) {
      setState(shopConfig)
    } else {
      setStateRaw(defaultValues)
    }
  }, [shopConfig])

  const input = formInput(state, newState => setState(newState))
  const Feedback = formFeedback(state)

  return (
    <>
      <h3>Settings</h3>
      <form
        onSubmit={async e => {
          e.preventDefault()
          const { valid, newState } = validate(state)
          setState(newState)
          if (valid) {
            const headers = new Headers({
              authorization: `bearer ${BACKEND_AUTH_TOKEN}`,
              'content-type': 'application/json'
            })
            const myRequest = new Request(`${config.backend}/config`, {
              headers,
              credentials: 'include',
              method: 'POST',
              body: JSON.stringify(newState)
            })
            const raw = await fetch(myRequest)
            if (raw.ok) {
              console.log('Saved')
            }
          } else {
            window.scrollTo(0, 0)
          }
        }}
      >
        <div className="form-group">
          <label>Data URL</label>
          <input type="text" {...input('dataUrl')} />
          {Feedback('dataUrl')}
        </div>
        <div className="form-group">
          <label>Public URL</label>
          <input type="text" {...input('publicUrl')} />
          {Feedback('publicUrl')}
        </div>
        <div className="form-group">
          <label>Printful API Key</label>
          <input type="text" {...input('printful')} />
          {Feedback('printful')}
        </div>
        <div className="form-group">
          <label>Stripe Backend</label>
          <input type="text" {...input('stripeBackend')} />
          {Feedback('stripeBackend')}
        </div>
        <div className="form-group">
          <label>Stripe Webhook Secret</label>
          <input type="text" {...input('stripeWebhookSecret')} />
          {Feedback('stripeWebhookSecret')}
        </div>
        <div className="form-group">
          <label>Stripe Webhook Secret</label>
          <input type="text" {...input('stripeWebhookSecret')} />
          {Feedback('stripeWebhookSecret')}
        </div>
        <div className="form-group">
          <label>PGP Public Key</label>
          <textarea rows="5" {...input('pgpPublicKey')} />
          {Feedback('pgpPublicKey')}
        </div>
        <div className="form-group">
          <label>PGP Private Key</label>
          <textarea rows="5" {...input('pgpPrivateKey')} />
          {Feedback('pgpPrivateKey')}
        </div>
        <div className="form-group">
          <label>PGP Private Key Password</label>
          <input type="text" {...input('pgpPrivateKeyPass')} />
          {Feedback('pgpPrivateKeyPass')}
        </div>
        <div className="actions">
          <button type="submit" className="btn btn-primary">
            Save
          </button>
        </div>
      </form>
    </>
  )
}

export default AdminSettings

require('react-styl')(`
`)
