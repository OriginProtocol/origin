import React, { useState, useEffect } from 'react'
import get from 'lodash/get'

import useConfig from 'utils/useConfig'
import { useStateValue } from 'data/state'
import CreateListing from './CreateListing'
import { formInput, formFeedback } from 'utils/formHelpers'

async function genPGP() {
  const randomArray = Array.from(crypto.getRandomValues(new Uint32Array(5)))
  const pgpPrivateKeyPass = randomArray.map(n => n.toString(36)).join('')

  const key = await openpgp.generateKey({
    userIds: [{ name: 'D-Shop', email: `dshop@example.com` }],
    curve: 'ed25519',
    passphrase: pgpPrivateKeyPass
  })
  const pgpPublicKey = key.publicKeyArmored.replace(/\\r/g, '')
  const pgpPrivateKey = key.privateKeyArmored.replace(/\\r/g, '')
  return { pgpPrivateKeyPass, pgpPublicKey, pgpPrivateKey }
}

const CreateShop = ({ next }) => {
  const { config } = useConfig()
  const [{ admin }] = useStateValue()
  const [advanced, setAdvanced] = useState(false)
  const [loading, setLoading] = useState(false)
  const [state, setStateRaw] = useState({
    listingId: '999-001-29',
    name: 'My Store',
    dataDir: 'mystore',
    hostname: 'mystore',
    printfulApi: '',
    pgpPublicKey: '',
    pgpPrivateKey: '',
    pgpPrivateKeyPass: '',
    web3Pk: ''
  })
  const setState = newState => setStateRaw({ ...state, ...newState })
  const input = formInput(state, newState => setState(newState))
  const Feedback = formFeedback(state)
  useEffect(() => {
    genPGP().then(pgpKeys => setStateRaw({ ...state, ...pgpKeys }))
  }, [])

  return (
    <>
      <div className="mb-4">Create a Shop:</div>
      <form
        className="sign-up"
        onSubmit={async e => {
          e.preventDefault()
          setLoading(true)
          const res = await fetch(`${config.backend}/shop`, {
            headers: { 'content-type': 'application/json' },
            credentials: 'include',
            method: 'POST',
            body: JSON.stringify(state)
          })
          const json = await res.json()
          setLoading(false)
          next(json)
        }}
      >
        <div className="form-group">
          <label>Shop Name</label>
          <input {...input('name')} placeholder="eg My Store" />
          {Feedback('name')}
        </div>
        <div className="form-group">
          <label>Hostname</label>
          <div className="input-group">
            <input {...input('hostname')} placeholder="mystore" />
            <div className="input-group-append">
              <span className="input-group-text">
                {`.${get(admin, 'network.domain')}`}
              </span>
            </div>
          </div>
          {Feedback('hostname')}
        </div>
        <div className="form-group">
          <label>Web3 PK (required for non-Eth payments)</label>
          <input {...input('web3Pk')} type="password" />
          {Feedback('web3Pk')}
        </div>
        {/* <div className="form-group">
          <label>Logo</label>
          <div className="custom-file">
            <input
              type="file"
              {...input('logo')}
              className="custom-file-input"
            />
            <label className="custom-file-label">Choose logo file</label>
          </div>
          {Feedback('logo')}
        </div>
        <div className="form-group">
          <label>Favicon</label>
          <div className="custom-file">
            <input
              type="file"
              onChange={e => console.log(e.nativeEvent)}
              className="custom-file-input"
            />
            <label className="custom-file-label">Choose favicon file</label>
          </div>
          {Feedback('favicon')}
        </div> */}
        <div className="form-group">
          <label>Printful API Key</label>
          <input {...input('printfulApi')} placeholder="Printful API Key" />
          {Feedback('printfulApi')}
        </div>
        <div className="mb-2">
          <a
            href="#"
            onClick={e => {
              e.preventDefault()
              setAdvanced(!advanced)
            }}
          >
            {advanced ? 'Hide advanced settings' : 'Show advanced settings'}
          </a>
        </div>
        {!advanced ? null : (
          <>
            <div className="form-group">
              <label>Existing Listing ID</label>
              <div className="d-flex align-items-center">
                <div style={{ flex: 1 }}>
                  <input {...input('listingId')} placeholder="eg 1-001-123" />
                  {Feedback('listingId')}
                </div>
                <div className="mx-3">or</div>
                <div style={{ flex: 1 }}>
                  <CreateListing
                    className="btn btn-outline-primary w-100"
                    onCreated={listingId =>
                      setStateRaw({ ...state, listingId })
                    }
                  >
                    <span className="btn-content">Create Listing</span>
                  </CreateListing>
                </div>
              </div>
            </div>
            <div className="form-group">
              <label>Data Dir</label>
              <input {...input('dataDir')} placeholder="mystore" />
              {Feedback('dataDir')}
            </div>
            <div className="form-group">
              <label>PGP Private Key Password</label>
              <input {...input('pgpPrivateKeyPass')} />
              {Feedback('pgpPrivateKeyPass')}
            </div>
            <div className="form-group">
              <label>PGP Private Key</label>
              <textarea {...input('pgpPrivateKey')} />
              {Feedback('pgpPrivateKey')}
            </div>
            <div className="form-group">
              <label>PGP Public Key</label>
              <textarea {...input('pgpPublicKey')} />
              {Feedback('pgpPublicKey')}
            </div>
          </>
        )}
        <button
          type="submit"
          className={`mt-3 btn btn-primary btn-lg align-self-center${
            loading ? ' disabled' : ''
          }`}
        >
          <span className="btn-content">
            {loading ? 'Deploying Shop...' : 'Continue'}
          </span>
        </button>
      </form>
    </>
  )
}

export default CreateShop
