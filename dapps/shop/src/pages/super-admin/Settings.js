import React, { useState, useEffect } from 'react'
import get from 'lodash/get'

import { formInput, formFeedback } from 'utils/formHelpers'
import useConfig from 'utils/useConfig'
import { useStateValue } from 'data/state'

import PasswordField from 'components/admin/PasswordField'

function validate(state) {
  const newState = {}

  if (!state.dataUrl) {
    newState.dataUrlError = 'Enter a data URL'
  }

  const valid = Object.keys(newState).every(f => f.indexOf('Error') < 0)

  return { valid, newState: { ...state, ...newState } }
}

const defaultValues = {
  pinataKey: '',
  pinataSecret: '',
  cloudflareEmail: '',
  cloudflareApiKey: '',
  domain: '',
  web3Pk: ''

  // provider: '',
  // providerWs: '',
  // ipfs: '',
  // ipfsApi: '',
  // marketplaceContract: '',
  // marketplaceVersion: '',
  // active: true
}

const SuperAdminSettings = () => {
  const [{ admin }] = useStateValue()
  const networkConfig = get(admin, 'network', {})
  const [saving, setSaving] = useState()

  const { config } = useConfig()
  const [state, setStateRaw] = useState(defaultValues)
  const setState = newState => setStateRaw({ ...state, ...newState })

  useEffect(() => {
    fetch(`${config.backend}/network/${networkConfig.networkId}`, {
      headers: { 'content-type': 'application/json' },
      credentials: 'include'
    }).then(async res => {
      if (res.ok) {
        const json = await res.json()
        setState(json)
      }
    })
  }, [])

  const input = formInput(state, newState => setState(newState))
  const Feedback = formFeedback(state)

  return (
    <form
      className="mt-3"
      onSubmit={async e => {
        e.preventDefault()
        const { valid, newState } = validate(state)
        setState(newState)

        if (valid) {
          setSaving('saving')
          const url = `${config.backend}/network/${networkConfig.networkId}`
          const raw = await fetch(url, {
            headers: { 'content-type': 'application/json' },
            credentials: 'include',
            method: 'PUT',
            body: JSON.stringify(newState)
          })
          if (raw.ok) {
            setSaving('ok')
            setTimeout(() => setSaving(null), 3000)
          }
        } else {
          window.scrollTo(0, 0)
        }
      }}
    >
      <div className="row">
        <div className="col-md-6">
          <div className="form-group">
            <label>Domain</label>
            <input type="text" {...input('domain')} />
            {Feedback('domain')}
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-md-6">
          <div className="form-group">
            <label>Web3 PK</label>
            <PasswordField field="web3Pk" input={input} />
            {Feedback('web3Pk')}
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-md-6">
          <div className="form-row">
            <div className="form-group col-md-6">
              <label>Pinata Key</label>
              <input type="text" {...input('pinataKey')} />
              {Feedback('pinataKey')}
            </div>
            <div className="form-group col-md-6">
              <label>Pinata Secret</label>
              <PasswordField field="pinataSecret" input={input} />
              {Feedback('pinataSecret')}
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-md-6">
          <div className="form-row">
            <div className="form-group col-md-6">
              <label>Cloudflare Email</label>
              <input type="text" {...input('cloudflareEmail')} />
              {Feedback('cloudflareEmail')}
            </div>
            <div className="form-group col-md-6">
              <label>Cloudflare API Key</label>
              <PasswordField field="cloudflareApiKey" input={input} />
              {Feedback('cloudflareApiKey')}
            </div>
          </div>
        </div>
      </div>

      <div className="actions">
        <button type="submit" className="btn btn-primary">
          Save
        </button>
        <span className="ml-2">
          {saving === 'saving'
            ? 'Saving...'
            : saving === 'ok'
            ? 'Saved OK ✅'
            : null}
        </span>
      </div>
    </form>
  )
}

export default SuperAdminSettings
