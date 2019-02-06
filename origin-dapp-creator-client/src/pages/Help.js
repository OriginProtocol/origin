import React from 'react'

class Help extends React.Component {
  render() {
    return (
      <>
        {/*
        <h2>Configuring Custom Domains</h2>
        <p>To configure a custom domain you will need to add two DNS entries:</p>
        <ul>
          <li>CNAME for yourdomain.com to dapp.originprotocol.com></li>
          <li>TXT for config.yourdomain.com to "dnslink=/ipfs/{"<ipfs_hash>"}"</li>
        </ul>
        <p>You should have received an IPFS hash for your configuration during creation process.</p>
        */}
        <h2>Troubleshooting</h2>
        <h3>My subdomain is not working.</h3>
        <p>
          Subdomains rely on DNS, and changes to DNS can take some time to
          propagate.
        </p>
        <h3>I am having another problem.</h3>
        <p>
          Our #engineering channel on our{' '}
          <a href="https://discord.gg/jyxpUSe">Discord server</a> is full of
          helpful engineers.
        </p>
      </>
    )
  }
}

export default Help
