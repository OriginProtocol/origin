import React, { useState, useEffect } from 'react'

import useConfig from 'utils/useConfig'
import { useStateValue } from 'data/state'
import { formInput, formFeedback } from 'utils/formHelpers'

const Defaults = {
  '1': {
    ipfs: 'https://ipfs-prod.ogn.app',
    ipfsApi: 'https://ipfs.ogn.app',
    marketplaceContract: '0x698Ff47B84837d3971118a369c570172EE7e54c2',
    marketplaceVersion: '001',
    provider: '',
    providerWs: ''
  },
  '4': {
    ipfs: 'https://ipfs-prod.ogn.app',
    ipfsApi: 'https://ipfs.ogn.app',
    marketplaceContract: '0x3D608cCe08819351adA81fC1550841ebc10686fd',
    marketplaceVersion: '001',
    provider: '',
    providerWs: ''
  },
  '999': {
    ipfs: 'http://localhost:8080',
    ipfsApi: 'http://localhost:5002',
    marketplaceContract: process.env.MARKETPLACE_CONTRACT,
    marketplaceVersion: '001',
    domain: 'localhost',
    provider: 'http://localhost:8545',
    providerWs: 'ws://localhost:8545'
  }
}

function initialState() {
  const networkId = window.location.href.indexOf('https') === 0 ? '1' : '999'
  return {
    networkId,
    domain: '',
    provider: '',
    providerWs: '',
    pinataKey: '',
    pinataSecret: '',
    cloudflareEmail: '',
    cloudflareApiKey: '',
    ipfs: '',
    ipfsApi: '',
    marketplaceContract: '',
    marketplaceVersion: '',
    ...Defaults[networkId]
  }
}

function validate(state) {
  const newState = {}

  if (!state.provider) {
    newState.providerError = 'Enter a WS provider'
  } else if (!state.provider.match(/^https?:\/\//)) {
    newState.providerError = 'Should start https:// or http://'
  }
  if (!state.providerWs) {
    newState.providerWsError = 'Enter a WS provider'
  } else if (!state.providerWs.match(/^wss?:\/\//)) {
    newState.providerWsError = 'Should start wss:// or ws://'
  }
  if (!state.domain) {
    newState.domainError = 'Enter a root domain'
  }
  if (!state.ipfs) {
    newState.ipfsError = 'Enter an IPFS Gateway'
  }
  if (!state.ipfsApi) {
    newState.ipfsApiError = 'IPFS API required'
  }

  const valid = Object.keys(newState).every(f => f.indexOf('Error') < 0)

  return { valid, newState: { ...state, ...newState } }
}

const ServerSetup = ({ next }) => {
  const { config } = useConfig()
  const [, dispatch] = useStateValue()
  const [advanced, setAdvanced] = useState(false)
  const [state, setStateRaw] = useState(initialState())
  const setState = newState => setStateRaw({ ...state, ...newState })
  const input = formInput(state, newState => setState(newState))
  const Feedback = formFeedback(state)

  useEffect(() => {
    if (Defaults[state.networkId]) {
      setState(Defaults[state.networkId])
    }
  }, [state.networkId])

  return (
    <>
      <div className="mb-4">Server setup:</div>
      <form
        className="sign-up"
        onSubmit={e => {
          e.preventDefault()

          const { valid, newState } = validate(state)
          setState(newState)

          if (!valid) {
            window.scrollTo(0, 0)
            return
          }

          const network = Object.keys(state)
            .filter(k => k.indexOf('Error') < 0)
            .reduce((m, o) => {
              m[o] = state[o]
              return m
            }, {})

          fetch(`${config.backend}/networks`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(network)
          })
            .then(async res => {
              if (res.ok) {
                dispatch({ type: 'setNetwork', network })
                next()
              }
            })
            .catch(err => {
              console.error('Error signing in', err)
              // setState({ ...state, error: 'Unauthorized' })
            })
        }}
      >
        <div className="form-row">
          <div className="form-group col-md-6">
            <label>Ethereum Network</label>
            <select {...input('networkId')}>
              <option value="1">Mainnet</option>
              <option value="4">Rinkeby</option>
              <option value="999">Localhost</option>
            </select>
            {Feedback('networkId')}
          </div>
          <div className="form-group col-md-6">
            <label>Root Domain</label>
            <input {...input('domain')} placeholder="eg mydshop.com" />
            {Feedback('domain')}
          </div>
        </div>
        <div className="form-row">
          <div className="form-group col-md-6">
            <label>Provider WebSocket</label>
            <input
              {...input('providerWs')}
              placeholder="eg wss://wss.infura.io/v3/YOUR-PROJECT-ID"
            />
            {Feedback('providerWs')}
          </div>
          <div className="form-group col-md-6">
            <label>Provider HTTPS</label>
            <input
              {...input('provider')}
              placeholder="eg https://mainnet.infura.io/v3/YOUR-PROJECT-ID"
            />
            {Feedback('provider')}
          </div>
        </div>
        <div className="form-row">
          <div className="form-group col-md-6">
            <label>Pinata Key</label>
            <input {...input('pinataKey')} />
            {Feedback('pinataKey')}
          </div>
          <div className="form-group col-md-6">
            <label>Pinata Secret</label>
            <input type="password" {...input('pinataSecret')} />
            {Feedback('pinataSecret')}
          </div>
        </div>
        <div className="form-row">
          <div className="form-group col-md-6">
            <label>Cloudflare Email</label>
            <input {...input('cloudflareEmail')} />
            {Feedback('cloudflareEmail')}
          </div>
          <div className="form-group col-md-6">
            <label>Cloudflare API Key</label>
            <input type="password" {...input('cloudflareApiKey')} />
            {Feedback('cloudflareApiKey')}
          </div>
        </div>
        <div className="mb-2 justify-content-center d-flex">
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
            <div className="form-row">
              <div className="form-group col-md-6">
                <label>IPFS Gateway</label>
                <input
                  {...input('ipfs')}
                  placeholder="eg https://ipfs-prod.ogn.app"
                />
                {Feedback('ipfs')}
              </div>
              <div className="form-group col-md-6">
                <label>IPFS API</label>
                <input
                  {...input('ipfsApi')}
                  placeholder="eg https://ipfs-prod.ogn.app"
                />
                {Feedback('ipfsApi')}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group col-md-6">
                <label>Marketplace Contract</label>
                <input
                  {...input('marketplaceContract')}
                  placeholder="eg 0x123456"
                />
                {Feedback('marketplaceContract')}
              </div>
              <div className="form-group col-md-6">
                <label>Marketplace Version</label>
                <input {...input('marketplaceVersion')} placeholder="eg 001" />
                {Feedback('marketplaceVersion')}
              </div>
            </div>
          </>
        )}
        <button
          type="submit"
          className="btn btn-primary mt-2 align-self-center px-5"
        >
          Continue
        </button>
      </form>
    </>
  )
}

export default ServerSetup
