import React from 'react'

const Footer = (props) => {
  return (
    <footer className="dark-footer">
      <div className="container">
        <div className="row">
          <div className="col-12 col-md-6">
            <div className="logo-container">
              <img src="images/origin-logo.svg" className="origin-logo" alt="Origin Protocol"/>
            </div>
            <p className="company-mission">
              Origin is building the sharing economy of tomorrow. Buyers and sellers will be able to transact without rent-seeking middlemen. We believe in lowering transaction fees, promoting free and transparent commerce, and giving early participants in the community a stake in the network.
            </p>
            <p>
              &copy; {(new Date().getFullYear())} Origin Protocol, Inc.
            </p>
          </div>
          <div className="col-12 col-md-6">
            <div className="row">
              <div className="col-6 col-md-4">
                <div className="footer-header">
                  Documentation
                </div>
                <ul className="footer-links">
                  <li>
                    <a href="https://www.originprotocol.com/product-brief">Product Brief</a>
                  </li>
                  <li>
                    <a href="https://www.originprotocol.com/whitepaper">Whitepaper</a>
                  </li>
                  <li>
                    <a href="https://github.com/OriginProtocol" target="_blank">Github</a>
                  </li>
                  <li>
                    <a href="http://docs.originprotocol.com/" target="_blank">Docs</a>
                  </li>
                </ul>
              </div>
              <div className="col-6 col-md-4">
                <div className="footer-header">
                  Community
                </div>
                <ul className="footer-links">
                  <li>
                    <a href="https://t.me/originprotocol" target="_blank">Telegram</a>
                  </li>
                  <li>
                    <a href="https://discord.gg/jyxpUSe" target="_blank">Discord</a>
                  </li>
                  <li>
                    <a href="https://medium.com/originprotocol" target="_blank">Medium</a>
                  </li>
                  <li>
                    <a href="https://twitter.com/originprotocol" target="_blank">Twitter</a>
                  </li>
                  <li>
                    <a href="https://instagram.com/originprotocol" target="_blank">Instagram</a>
                  </li>
                  <li>
                    <a href="https://www.facebook.com/originprotocol" target="_blank">Facebook</a>
                  </li>
                </ul>
              </div>
              <div className="col-6 col-md-4">
                <div className="footer-header">
                  Organization
                </div>
                <ul className="footer-links">
                  <li>
                    <a href="http://www.originprotocol.com/team">Team</a>
                  </li>
                  <li>
                    <a href="http://www.originprotocol.com/presale">Presale</a>
                  </li>
                  <li>
                    <a href="http://www.originprotocol.com/partners">Partners</a>
                  </li>
                  <li>
                    <a href="https://angel.co/originprotocol/jobs">Jobs (We&rsquo;re hiring!)</a>
                  </li>
                  <li>
                    <a href="https://www.google.com/maps/place/845+Market+St+%23450a,+San+Francisco,+CA+94103">845 Market St, #450A, San Francisco, CA 94103</a>
                  </li>
                  <li>
                    <a href="mailto:info@originprotocol.com">info@originprotocol.com</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
