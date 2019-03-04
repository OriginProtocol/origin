import React, { Component } from 'react'
import moment from 'moment'
import {
  Button,
  Dialog,
  FormGroup,
  Label
} from '@blueprintjs/core'

import { refreshGrants, setTransferDialogOpen } from '../actions'
import { connect } from 'react-redux'

const initialState = {
  amount: 0,
  address: '',
  transferInProgress: false
}

class TransferDialog extends Component {
  constructor(props) {
    super(props)
    this.state = { ...initialState }
  }

  handleClose = () => {
    this.props.setOpen(false)
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.isOpen && this.props.isOpen) {
      this.setState({ ...initialState })
    }
  }

  handleTransfer = () => {
    this.setState({ ...this.state, transferInProgress: true })
    const transferRequest = {
      grantId: this.props.grant.id,
      amount: this.state.amount,
      address: this.state.address
    }

    const postBody = new Blob(
      [ JSON.stringify(transferRequest) ],
      { type: 'application/json' }
    )
    fetch('/api/transfer', { method: 'POST', body: postBody })
      .then((response) => {
        if (response.ok) {
          console.log('success!')
        } else {
          console.error(`token transfer error: ${response.status} ${response.statusText}`)
        }
        this.handleClose()
        this.props.refreshGrants()
      })
  }

  handleAmountChange = event => {
    const amount = event.target.value
    this.setState({ ...this.state, amount })
  }

  handleAddressChange = event => {
    const address = event.target.value
    this.setState({ ...this.state, address })
  }

  render() {
    const { isOpen, grant } = this.props
    if (!grant) {
      return (
        <div></div>
      )
    }

    const grantDate = moment(grant.grantedAt).format('YYYY-MM-DD')
    const available = grant.vested - grant.transferred
    const availableStr = available.toLocaleString()
    const { amount, address } = this.state

    return (
      <Dialog onClose={this.handleClose} isOpen={isOpen} id="transferDialog">
        <div className="bp3-dialog-header">
          <span className="bp3-icon-large bp3-icon-arrow-right"></span>
          <h4 className="bp3-heading">Transfer Tokens</h4>
          <button
            aria-label="Close"
            className="bp3-dialog-close-button bp3-icon-small-cross"
            onClick={this.handleClose}
            disabled={this.state.transferInProgress}></button>
        </div>
        <div className="bp3-dialog-body">
          You have <strong>{availableStr} OGN</strong> available to transfer
          from your grant dated {' '} <strong>{grantDate}</strong>. How many
          tokens would you like to transfer?

          <div id="transferForm">
            {/* TODO: add form validation */}
            <FormGroup>
              <Label>Number of tokens to transfer:</Label>
              <input
                className="bp3-input-group"
                onChange={this.handleAmountChange}
                value={amount}
                disabled={this.state.transferInProgress}
                />
              <Label>Address to transfer to:</Label>
              {/* TODO: add dropdown of previously used addresses */}
              <input
                className="bp3-input-group"
                onChange={this.handleAddressChange}
                value={address}
                disabled={this.state.transferInProgress}
                />
            </FormGroup>
          </div>
        </div>

        <div className="bp3-dialog-footer">
          <div className="bp3-dialog-footer-actions">
            <button
              type="button"
              className="bp3-button"
              onClick={this.handleClose}
              disabled={this.state.transferInProgress}>
              Cancel
            </button>
            <Button type="submit"
                    className="bp3-button bp3-intent-primary"
                    onClick={this.handleTransfer}
                    disabled={this.state.transferInProgress}
                    loading={this.state.transferInProgress}>
              Transfer
            </Button>
          </div>
        </div>
      </Dialog>
    )
  }
}

const mapStateToProps = state => {
  return {
    grant: state.transferDialogGrant,
    isOpen: state.transferDialogOpen
  }
}

const mapDispatchToProps = dispatch => {
  return {
    refreshGrants: () => dispatch(refreshGrants()),
    setOpen: (open) => dispatch(setTransferDialogOpen(open))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TransferDialog)
