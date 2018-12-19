import React from 'react'
import {
  Button,
  Classes,
  ControlGroup,
  Dialog,
  FormGroup,
  Intent,
  InputGroup
} from '@blueprintjs/core'

import superagent from 'superagent'

class LoadDialog extends React.Component {
  constructor (props) {
    super(props)
    this.state = { ipfsHash: '' }
    this.handleLoad = this.handleLoad.bind(this)
  }

  handleLoad () {
    superagent
      .get(`${process.env.IPFS_GATEWAY_URL}/ipfs/${this.state.ipfsHash}`)
      .then((response) => { this.props.onConfigChange(response.body) })
  }

  render () {
    const input = field => ({
      value: this.state[field],
      onChange: e => this.setState({ [field]: e.currentTarget.value })
    })

    return (
      <Dialog
          title="Load Existing Configuration"
          isOpen={this.props.isOpen}
          onClose={this.props.onClose}>
        <div className={Classes.DIALOG_BODY}>
          <FormGroup label="IPFS Hash">
            <ControlGroup fill={true}>
              <InputGroup {...input('ipfsHash')} />
            </ControlGroup>
          </FormGroup>
        </div>

        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button
                onClick={this.handleLoad}
                intent={Intent.PRIMARY}>
              Load
            </Button>
          </div>
        </div>
      </Dialog>
    )
  }
}

export default LoadDialog
