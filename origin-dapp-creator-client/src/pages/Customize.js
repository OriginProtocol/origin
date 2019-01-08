import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button, Intent } from '@blueprintjs/core'
import superagent from 'superagent'

import AboutField from 'components/fields/AboutField'
import TitleField from 'components/fields/TitleField'
import LanguageCodeField from 'components/fields/LanguageCodeField'
import LogoUrlField from 'components/fields/LogoUrlField'
import IconUrlField from 'components/fields/IconUrlField'
import SubdomainField from 'components/fields/SubdomainField'
import ColorPicker from 'components/ColorPicker'
import SuccessDialog from 'components/dialogs/SuccessDialog'
import LoadDialog from 'components/dialogs/LoadDialog'
import { AppToaster } from '../toaster'

import { baseConfig } from 'origin-dapp/src/config'

class Form extends Component {
  constructor(props, context) {
    super(props)

    this.web3Context = context.web3
  }

  async web3Sign(data, account) {
    // Promise wrapper for web3 signing
    return new Promise((resolve, reject) => {
      web3.personal.sign(data, account, (err, sig) => {
        if (err) {
          reject(err)
        }
        resolve(sig)
      })
    })
  }

  async handleSubmit (event) {
    event.preventDefault()

    this.setState({ publishing: true })

    let signature = null
    if (this.state.config.subdomain) {
      // Generate a valid signature if a subdomain is in use
      const dataToSign = JSON.stringify(this.state.config)
      signature = await this.web3Sign(dataToSign, web3.eth.accounts[0])
    }

    return superagent.post(`${process.env.DAPP_CREATOR_API_URL}/config`)
      .send({
        config: this.state.config,
        signature: signature,
        address: web3.eth.accounts[0]
      })
      .then((res) => {
        this.setState({
          ipfsHash: res.text,
          successDialogIsOpen: true
        })
      })
      .catch(this.handleServerErrors)
      .finally(() => this.setState({ publishing: false }))
  }

  async handlePreview () {
    this.setState({ previewing: true })

    let response
    try {
      response = await superagent
        .post(`${process.env.DAPP_CREATOR_API_URL}/config/preview`)
        .send({ config: this.state.config })
    } catch(error) {
      console.log('An error occurred generating preview: ' + error)
      return
    } finally {
      this.setState({ previewing: false })
    }

    const ipfsPath = `${process.env.IPFS_GATEWAY_URL}/ipfs/${response.text}`
    window.open(`${process.env.DAPP_URL}/?config=${ipfsPath}`, '_blank')
  }

  render () {
    return (
      <>
        <form onSubmit={this.handleSubmit}
          <h1>Customize your Marketplace's Appearance</h1>
          <h4>Choose a logo and colors for your marketplace below.</h4>
        </form>
      </>
    )
  }
}

Form.contextTypes = {
  web3: PropTypes.object
}

export default Form
