import React, { Component } from 'react'
import { Query } from 'react-apollo'
import QRCode from 'qrcode.react'
import * as clipboard from 'clipboard-polyfill'

import Modal from 'components/Modal'
import WalletLinkerQuery from 'queries/WalletLinker'
import { mobileDevice } from 'utils/mobile'

const walletLandingUrl = 'https://www.originprotocol.com/mobile'

// Shows a QR code for linking the user's browser with a mobile wallet. It
// automatically shows itself when there's a linker code available, which is
// triggered by the wallet linker client.
export default class MobileLinkerCode extends Component {
  constructor(props) {
    super(props)
    this.state = {
      shouldClose: false
    }
    this.openLinkerApp = this.openLinkerApp.bind(this)
  }

  async openLinkerApp(role, linkCode) {
    await clipboard.writeText(`orgw:${linkCode}`)
    window.open(`${walletLandingUrl}${role ? `?role=${role}` : ''}`)
  }

  render() {
    const { role } = this.props
    const isMobileDevice = mobileDevice()

    return (
      <Query query={WalletLinkerQuery} pollInterval={1000}>
        {({ data, error, loading }) => {
          if (loading) return null
          if (error) {
            console.error(error)
            return null
          }

          const linkCode = data.walletLinker.linkCode
          if (!linkCode) return null

          return (
            <Modal
              shouldClose={this.state.shouldClose}
              onClose={() => this.setState({ shouldClose: false })}
            >
              {isMobileDevice && (
                <>
                  <div style={{ marginBottom: '20px' }}>
                    To complete this action, link your Origin Wallet with this
                    code:
                    <br />
                    <pre
                      className="d-inline-block"
                      style={{
                        background: 'white',
                        borderRadius: '4px',
                        marginTop: '10px',
                        padding: '0.5rem'
                      }}
                    >
                      {linkCode}
                    </pre>
                  </div>
                  <button
                    className="btn btn-primary"
                    style={{ width: 'auto' }}
                    onClick={() => this.openLinkerApp(role)}
                  >
                    Copy &amp; Open App
                  </button>
                </>
              )}
              {!isMobileDevice && (
                <>
                  <div style={{ marginBottom: '20px' }}>
                    To complete this transaction, link your Origin Wallet by
                    scanning the QR code with your phone&apos;s camera:
                    <br />
                  </div>
                  <div style={{ backgroundColor: 'white', padding: '50px' }}>
                    <QRCode
                      value={`${walletLandingUrl}/${linkCode}${
                        role ? `?role=${role}` : ''
                      }`}
                    />
                    <pre className="mb-0 mt-3">{linkCode}</pre>
                  </div>
                </>
              )}
              <div className="actions">
                <button
                  className="btn btn-outline-light"
                  onClick={() => this.setState({ shouldClose: true })}
                  children="Cancel"
                />
              </div>
            </Modal>
          )
        }}
      </Query>
    )
  }
}
