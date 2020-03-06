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
  listener: false,
  dataUrl: '',
  publicUrl: '',
  printful: '',
  stripeBackend: '',
  stripeWebhookSecret: '',
  pgpPublicKey: '',
  pgpPrivateKey: '',
  pgpPrivateKeyPass: '',

  email: 'disabled',
  sendgridApiKey: '',
  sendgridUsername: '',
  sendgridPassword: '',
  mailgunSmtpServer: '',
  mailgunSmtpPort: '',
  mailgunSmtpLogin: '',
  mailgunSmtpPassword: '',
  awsRegion: '',
  awsAccessKey: '',
  awsAccessSecret: ''
}

async function testKey({ msg, pgpPublicKey, pgpPrivateKey, pass }) {
  if (!pgpPrivateKey) {
    return 'No private key'
  }
  const pubKeyObj = await openpgp.key.readArmored(pgpPublicKey)
  const encrypted = await openpgp.encrypt({
    message: openpgp.message.fromText(msg),
    publicKeys: pubKeyObj.keys
  })

  const privateKey = await openpgp.key.readArmored(pgpPrivateKey)
  if (privateKey.err && privateKey.err.length) {
    throw privateKey.err[0]
  }
  const privateKeyObj = privateKey.keys[0]
  await privateKeyObj.decrypt(pass)

  const message = await openpgp.message.readArmored(encrypted.data)
  const options = { message, privateKeys: [privateKeyObj] }

  const plaintext = await openpgp.decrypt(options)

  return plaintext.data === msg ? '✅' : '❌'
}

const AdminSettings = () => {
  const { config } = useConfig()
  const { shopConfig } = useShopConfig()
  const [saving, setSaving] = useState()
  const [state, setStateRaw] = useState(defaultValues)
  const [keyValid, setKeyValid] = useState(false)
  const setState = newState => setStateRaw({ ...state, ...newState })

  useEffect(() => {
    if (shopConfig) {
      setState(shopConfig)
    } else {
      setStateRaw(defaultValues)
    }
  }, [shopConfig])

  useEffect(() => {
    async function doTest() {
      try {
        const result = await testKey({
          pgpPublicKey: config.pgpPublicKey,
          pgpPrivateKey: state.pgpPrivateKey,
          pass: state.pgpPrivateKeyPass,
          msg: 'Test'
        })
        setKeyValid(result)
      } catch (e) {
        setKeyValid(e.message)
      }
    }
    doTest()
  }, [config.pgpPublicKey, state.pgpPrivateKey, state.pgpPrivateKeyPass])

  const input = formInput(state, newState => setState(newState))
  const Feedback = formFeedback(state)

  return (
    <>
      <h3>Settings</h3>
      <form
        className="mt-3"
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
            setSaving('saving')
            const raw = await fetch(myRequest)
            if (raw.ok) {
              setSaving('ok')
              setTimeout(() => setSaving(null), 3000)
            }
          } else {
            window.scrollTo(0, 0)
          }
        }}
      >
        <div className="form-group">
          <label>Listener</label>
          <div className="btn-group d-block">
            <button
              className={`btn btn-${state.listener ? '' : 'outline-'}primary`}
              onClick={() => setState({ listener: true })}
            >
              On
            </button>
            <button
              className={`btn btn-${!state.listener ? '' : 'outline-'}primary`}
              onClick={() => setState({ listener: false })}
            >
              Off
            </button>
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
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
              <label>Email Notifications</label>
              <select {...input('email')}>
                <option value="disabled">Disabled</option>
                <option value="sendgrid">Sendgrid</option>
                <option value="mailgun">Mailgun</option>
                <option value="aws">AWS SES</option>
              </select>
              {Feedback('email')}
            </div>
            {state.email !== 'sendgrid' ? null : (
              <>
                <div className="form-group">
                  <label>Sendgrid API Key</label>
                  <input type="text" {...input('sendgridApiKey')} />
                  {Feedback('sendgridApiKey')}
                </div>
                <div className="row">
                  <div className="form-group col-6">
                    <label>Username</label>
                    <input type="text" {...input('sendgridUsername')} />
                    {Feedback('sendgridUsername')}
                  </div>
                  <div className="form-group col-6">
                    <label>Password</label>
                    <input type="text" {...input('sendgridPassword')} />
                    {Feedback('sendgridPassword')}
                  </div>
                </div>
              </>
            )}
            {state.email !== 'mailgun' ? null : (
              <>
                <div className="row">
                  <div className="form-group col-8">
                    <label>Host</label>
                    <input type="text" {...input('mailgunSmtpServer')} />
                    {Feedback('mailgunSmtpServer')}
                  </div>
                  <div className="form-group col-4">
                    <label>Port</label>
                    <input type="text" {...input('mailgunSmtpPort')} />
                    {Feedback('mailgunSmtpPort')}
                  </div>
                </div>
                <div className="row">
                  <div className="form-group col-6">
                    <label>Login</label>
                    <input type="text" {...input('mailgunSmtpLogin')} />
                    {Feedback('mailgunSmtpLogin')}
                  </div>
                  <div className="form-group col-6">
                    <label>Password</label>
                    <input type="text" {...input('mailgunSmtpPassword')} />
                    {Feedback('mailgunSmtpPassword')}
                  </div>
                </div>
              </>
            )}
            {state.email !== 'aws' ? null : (
              <>
                <div className="form-group">
                  <label>AWS Region</label>
                  <input type="text" {...input('awsRegion')} />
                  {Feedback('awsRegion')}
                </div>
                <div className="row">
                  <div className="form-group col-6">
                    <label>Access Key</label>
                    <input type="text" {...input('awsAccessKey')} />
                    {Feedback('awsAccessKey')}
                  </div>
                  <div className="form-group col-6">
                    <label>Secret</label>
                    <input type="text" {...input('awsAccessSecret')} />
                    {Feedback('awsAccessSecret')}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="col-md-6">
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
              <label>Printful API Key</label>
              <input type="text" {...input('printful')} />
              {Feedback('printful')}
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              <label>PGP Public Key (from config.json)</label>
              <textarea
                className="form-control"
                value={config.pgpPublicKey}
                rows={5}
                readOnly
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label>PGP Private Key</label>
              <textarea rows="5" {...input('pgpPrivateKey')} />
              {Feedback('pgpPrivateKey')}
            </div>
          </div>
        </div>
        <div className="form-group">
          <label>PGP Public Key String</label>
          <input
            className="form-control"
            readOnly
            value={config.pgpPublicKey.replace(/\n/g, '\\n')}
          />
        </div>
        <div className="form-group">
          <label>PGP Private Key Password</label>
          <input type="text" {...input('pgpPrivateKeyPass')} />
          {Feedback('pgpPrivateKeyPass')}
        </div>
        <div className="form-group">{`Keys match: ${keyValid}`}</div>
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
    </>
  )
}

export default AdminSettings

require('react-styl')(`
`)
