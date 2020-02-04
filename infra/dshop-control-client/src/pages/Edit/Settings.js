import React, { useState } from 'react'
import { useStoreState } from 'pullstate'
import { useToasts } from 'react-toast-notifications'

import ImagePicker from 'components/Edit/ImagePicker'
import store from '@/store'

const Settings = () => {
  const { addToast } = useToasts()

  const settings = useStoreState(store, s => s.settings)

  const [title, setTitle] = useState(settings.title || '')
  const [fullTitle, setFullTitle] = useState(settings.fullTitle || '')
  const [byline, setByline] = useState(settings.byline || '')
  const [footer, setFooter] = useState(settings.footer || '')
  const [logoUrl, setLogoUrl] = useState(
    settings.logoUrl || 'https://shoporigin.com/images/origin-logo-black.svg'
  )

  const [supportEmail, setSupportEmail] = useState(settings.supportEmail || '')
  const [emailSubject, setEmailSubject] = useState(settings.emailSubject || '')
  const [twitter, setTwitter] = useState(settings.twitter || '')
  const [medium, setMedium] = useState(settings.medium || '')
  const [instagram, setInstagram] = useState(settings.instagram || '')
  const [facebook, setFacebook] = useState(settings.facebook || '')

  const [pgpPublicKey, setPgpPublicKey] = useState(settings.pgpPublicKey || '')

  const [backend, setBackend] = useState(
    settings.backend || 'https://backend.ogn.app'
  )
  const [discountCodes, setDiscountCodesEnabled] = useState(
    settings.discountCodes
  )
  const [stripeEnabled, setStripeEnabled] = useState(!!settings.stripeKey)
  const [stripeKey, setStripeKey] = useState(settings.stripeKey || '')

  const handleSave = () => {
    store.update(s => {
      return {
        ...s,
        settings: {
          title,
          fullTitle,
          byline,
          footer,
          logoUrl,

          supportEmail,
          emailSubject,
          twitter,
          medium,
          instagram,
          facebook,

          pgpPublicKey,

          backend,
          discountCodes,
          stripeKey
        }
      }
    })
    addToast('Dshop settings updated!', {
      appearance: 'success',
      autoDismiss: true
    })
  }

  const handleFileUpload = (name, url) => {
    setLogoUrl(url)
  }

  return (
    <>
      <div className="d-flex justify-content-between">
        <h3>Settings</h3>
      </div>

      <div className="row mt-4">
        <div className="col-12 col-lg-6 mb-4">
          <div className="card">
            <div className="card-header">General</div>
            <div className="card-body">
              <div className="form-group">
                <label>Full Title</label>
                <input
                  className="form-control"
                  onChange={e => setFullTitle(e.target.value)}
                  value={fullTitle}
                  placeholder="eg My Store"
                />
              </div>
              <div className="form-group">
                <label>
                  Title <small>(shown after logo in header)</small>
                </label>
                <input
                  className="form-control"
                  onChange={e => setTitle(e.target.value)}
                  value={title}
                  placeholder="eg My Store"
                />
              </div>
              <div className="form-group">
                <label>Byline</label>
                <input
                  className="form-control"
                  onChange={e => setByline(e.target.value)}
                  value={byline}
                  placeholder="eg A Decentralized Swag Store"
                />
              </div>
              <div className="form-group">
                <label>Footer</label>
                <input
                  className="form-control"
                  onChange={e => setFooter(e.target.value)}
                  value={footer}
                  placeholder="eg &copy; 2019 Origin Protocol"
                />
              </div>
              <div className="form-group">
                <label>Logo</label>
                <ImagePicker
                  title="Logo"
                  name="logoUrl"
                  recommendedSize={'100px x 100px'}
                  onUpload={handleFileUpload}
                  imageUrl={logoUrl}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6 mb-4">
          <div className="card">
            <div className="card-header">Social</div>
            <div className="card-body">
              <div className="form-group">
                <label>Twitter</label>
                <input
                  className="form-control"
                  onChange={e => setTwitter(e.target.value)}
                  value={twitter}
                  placeholder="eg https://twitter.com/originprotocol"
                />
              </div>
              <div className="form-group">
                <label>Medium</label>
                <input
                  className="form-control"
                  onChange={e => setMedium(e.target.value)}
                  value={medium}
                  placeholder="eg https://medium.com/originprotocol"
                />
              </div>
              <div className="form-group">
                <label>Instagram</label>
                <input
                  className="form-control"
                  onChange={e => setInstagram(e.target.value)}
                  value={instagram}
                  placeholder="eg https://www.instagram.com/originprotocol/"
                />
              </div>
              <div className="form-group">
                <label>Facebook</label>
                <input
                  className="form-control"
                  onChange={e => setFacebook(e.target.value)}
                  value={facebook}
                  placeholder="eg https://www.facebook.com/originprotocol"
                />
              </div>
            </div>
          </div>
          <div className="card mt-4">
            <div className="card-header">Encryption</div>
            <div className="card-body">
              <label>PGP Public Key</label>
              <textarea
                className="form-control"
                onChange={e => setPgpPublicKey(e.target.value)}
                value={pgpPublicKey}
                rows="5"
              ></textarea>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6 mb-4">
          <div className="card">
            <div className="card-header">Contact</div>
            <div className="card-body">
              <div className="form-group">
                <label>Support Email</label>
                <input
                  className="form-control"
                  onChange={e => setSupportEmail(e.target.value)}
                  value={supportEmail}
                />
              </div>
              <div className="form-group">
                <label>Order Email Subject</label>
                <input
                  className="form-control"
                  onChange={e => setEmailSubject(e.target.value)}
                  value={emailSubject}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6 mb-4">
          <div className="card">
            <div className="card-header">Integrations</div>
            <div className="card-body">
              <div className="form-group">
                <label>Backend</label>
                <input
                  className="form-control"
                  onChange={e => setBackend(e.target.value)}
                  value={backend}
                  placeholder="eg https://backend.ogn.app"
                />
              </div>
              <div className="form-group">
                <div className="custom-control custom-switch">
                  <input
                    type="checkbox"
                    className="custom-control-input"
                    id="discount-enable-switch"
                    onChange={e => {
                      setDiscountCodesEnabled(e.target.checked)
                    }}
                    checked={discountCodes}
                  />
                  <label
                    className="custom-control-label"
                    htmlFor="discount-enable-switch"
                  >
                    Enable Discount codes
                  </label>
                </div>
              </div>
              <div className="form-group">
                <div className="custom-control custom-switch">
                  <input
                    type="checkbox"
                    className="custom-control-input"
                    id="stripe-enable-switch"
                    onChange={e => {
                      setStripeEnabled(e.target.checked)
                    }}
                    checked={stripeEnabled}
                  />
                  <label
                    className="custom-control-label"
                    htmlFor="stripe-enable-switch"
                  >
                    Enable Stripe payments
                  </label>
                </div>
              </div>
              {stripeEnabled && (
                <div className="form-group">
                  <label>Stripe Public Key</label>
                  <input
                    className="form-control"
                    onChange={e => setStripeKey(e.target.value)}
                    value={stripeKey}
                    disabled={!stripeEnabled}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <button className="btn btn-lg btn-primary" onClick={handleSave}>
          Save
        </button>
      </div>
    </>
  )
}

export default Settings
