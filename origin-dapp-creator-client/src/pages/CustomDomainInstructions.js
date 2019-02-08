'use strict'

import React from 'react'

import * as clipboard from 'clipboard-polyfill'

class CustomDomainInstructions extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <>
        <div className="custom-domain">
          <h1>Add a Custom Domain</h1>
          <h4>
            You will need to add a couple of DNS records at your domain
            registrar
          </h4>
          <p>
            The A record should be for the custom domain or subdomain you want
            to use, for example <i>dapp.yourdomain.com</i>. The TXT record
            should then be that hostname prefixed with <i>config.</i>, for
            example <i>config.dapp.yourdomain.com.</i>
          </p>
          <div className="form-group">
            <label>A Record</label>
            <div className="input-group input-group-lg">
              <input
                className="form-control"
                value={process.env.SSL_ISSUER_IP}
                readOnly
              />
              <div className="input-group-append">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => clipboard.writeText(process.env.SSL_ISSUER_IP)}
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
          <div className="form-group">
            <label>TXT Record</label>
            <div className="input-group input-group-lg">
              <input
                className="form-control"
                value={`dnslink=/ipfs/${this.props.publishedIpfsHash}`}
                readOnly
              />
              <div className="input-group-append">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() =>
                    clipboard.writeText(
                      `dnslink=/ipfs/${this.props.publishedIpfsHash}`
                    )
                  }
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col box">
            <div className="box-title">Need instructions?</div>

            <div>
              <a href="https://www.godaddy.com/help/manage-dns-zone-files-680">
                Godaddy Instructions
              </a>
            </div>
            <div>
              <a href="https://www.namecheap.com/support/knowledgebase/article.aspx/767/10/how-to-change-dns-for-a-domain">
                Namecheap Instructions
              </a>
            </div>
          </div>

          <div className="col box">
            <div className="box-title">Need assistance?</div>

            <div>
              <a href="https://discord.gg/jyxpUSe">Discord</a>
            </div>
            <div>
              <a href="mailto:support@originprotocol.com">Email</a>
            </div>
          </div>
        </div>
      </>
    )
  }
}

require('react-styl')(`
  .customin-domain
    padding: 2rem 0

  .box
    background: var(--pale-grey-eight)
    border-radius: var(--default-radius)
    margin: 1rem
    padding: 2rem

  .box-title
    padding-bottom: 1rem
`)

export default CustomDomainInstructions
