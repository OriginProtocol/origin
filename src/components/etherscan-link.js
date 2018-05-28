import React, { Component } from 'react'

class EtherscanLink extends Component {

  constructor(props) {
    super(props)
    this.state = {networkName: null}
  }

  async componentDidMount() {
    const networkName = await web3.eth.net.getNetworkType() // Actually returns name, e.g. 'ropsten'
    this.setState({networkName})
  }

  render() {

    const { hash } = this.props
    const { networkName } = this.state
    let href, path

    if (!hash) {
      throw new Error("EtherscanLink: hash must exist")
    }

    // detect transaction hashes
    if (hash.length === 66) {
      path = `tx/${hash}`
    // detect address hashes
    } else if (hash.length === 42) {
      path = `address/${hash}`
    } else {
      throw new Error("Unrecognized hash for EtherscanLink")
    }

    // link to the correct
    if (networkName === "main") {
      href = `https://etherscan.io/${path}`
    } else if (networkName !== "private") {
      href = `https://${networkName}.etherscan.io/${path}`
    }

    return <a target="_blank" href={href}>{hash}</a>
  }
}

export default EtherscanLink
