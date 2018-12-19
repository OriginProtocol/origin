import React from 'react'

class Help extends React.Component {
  render () {
    return (
      <>
        <h2>Configuring Custom Domains</h2>
        <p>To configure a custom domain you will need to add two DNS entries:</p>
        <ul>
          <li>CNAME for yourdomain.com to dapp.originprotocol.com></li>
          <li>TXT for config.yourdomain.com to "dnslink=/ipfs/{"<ipfs_hash>"}"</li>
        </ul>
        <p>You should have received an IPFS hash for your configuration during creation process.</p>
        <h2>Configuring Subdomains</h2>
        <p>If you elected to use a subdomain on orgindapp.com there is no configuration necessary.</p>
        <h3>My subdomain is not working?</h3>
        <p>Subdomains rely on DNS, and changes to DNS can take some time to propagate. If you think something else may be wrong, please ping is in our #engineering channel on Discord.</p>
      </>
    )
  }
}

export default Help
