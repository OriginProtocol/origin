import React from 'react'

import { AnchorButton, Button, Classes, Dialog, Intent } from '@blueprintjs/core'

class SuccessDialog extends React.Component {

  constructor(props) {
    super(props)
    this.handleClose = this.handleClose.bind(this)
  }

  handleClose () {
  }

  render () {
    return (
      <Dialog
          isOpen={this.props.isOpen}
          icon="info-sign"
          onClose={this.handleClose}
          title="Marketplace Successfully Configured!"
          {...this.state}
      >
        <div className={Classes.DIALOG_BODY}>
          <p>
            Your decentralized marketplace was successfully created! It will shortly be available at {this.props.subdomain}.
          </p>
          <p>
            <strong>
              Because you configured your marketplace using a subdomain it will take a while for the DNS changes to propagate and your marketplace to be accessible.
            </strong>
          </p>
          <div className={Classes.DIALOG_FOOTER}>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                <Button onClick={this.handleClose}>Close</Button>
                <AnchorButton
                    intent={Intent.PRIMARY}
                    href={'https://' + this.props.subdomain + process.env.CREATOR_SUBDOMAIN}
                    target="_blank"
                >
                    Visit my marketplace
                </AnchorButton>
            </div>
          </div>
        </div>
      </Dialog>
    )
  }
}

export default SuccessDialog
