import React from 'react'

import {
  AnchorButton,
  Button,
  Classes,
  ControlGroup,
  Dialog,
  FormGroup,
  InputGroup,
  Intent
} from '@blueprintjs/core'

function SubdomainMessage (props) {
  return (
    <>
      <p>
        Your decentralized marketplace was successfully created! It will shortly be available at {props.config.subdomain}.
      </p>
      <p>
        <strong>Because you configured your marketplace using a subdomain it will take a while for the DNS changes to propagate and your marketplace to be accessible.</strong>
      </p>
    </>
  )
}

function CustomDomainMessage (props) {
  return (
    <>
      <p>
        Your decentralized marketplace configuration has been created. The IPFS hash of your configuration is:
      </p>

      <FormGroup>
        <ControlGroup>
          <InputGroup
            className="bp3-fill"
            value={props.ipfsHash}
            onChange={() => {}} />
          <Button>
            Copy
          </Button>
        </ControlGroup>
      </FormGroup>

      <p>
        <strong>You should save this hash.</strong>
      </p>

      <p>
        Please see our documentation for an exaplanation of how to configure your DNS records.
      </p>
    </>
  )
}


class SuccessDialog extends React.Component {

  render () {
    return (
      <Dialog
          isOpen={this.props.isOpen}
          onClose={this.props.onClose}
          icon="info-sign"
          title="Marketplace Successfully Configured!"
          {...this.state}>
        <div className={Classes.DIALOG_BODY}>
          {this.props.config.subdomain ? (
            <SubdomainMessage config={this.props.config} />
          ) : (
            <CustomDomainMessage ipfsHash={this.props.ipfsHash} />
          )}
          <div className={Classes.DIALOG_FOOTER}>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                <Button onClick={this.props.onClose}>Close</Button>
                {this.props.config.subdomain && (
                  <AnchorButton
                      intent={Intent.PRIMARY}
                      href={`https://${this.props.config.subdomain}.${process.env.CREATOR_DOMAIN}`}
                      target="_blank">
                    Visit my marketplace
                  </AnchorButton>
                )}
            </div>
          </div>
        </div>
      </Dialog>
    )
  }
}

export default SuccessDialog
