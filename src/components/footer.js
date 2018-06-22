import React, { Component } from 'react'
import $ from 'jquery'



class Footer extends Component {
  render() {
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
                <div className="col-6 col-md-3">
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
                <div className="col-4 col-md-3">
                  <div className="footer-header">
                    Community
                  </div>
                  <ul className="footer-links">
                    <li>
                      <a href="https://t.me/originprotocol" target="_blank"><i class="fab fa-telegram"></i> Telegram</a>
                    </li>
                    <li>
                      <a href="https://discord.gg/jyxpUSe" target="_blank"><i class="fab fa-discord"></i> Discord</a>
                    </li>
                    <li>
                      <a href="https://medium.com/originprotocol" target="_blank"><i class="fab fa-medium"></i> Medium</a>
                    </li>
                    <li>
                      <a href="https://www.reddit.com/r/originprotocol/" target="_blank"><i class="fab fa-reddit"></i> Reddit</a>
                    </li>
                    <li>
                      <span class="span-link" data-container="body" data-toggle="tooltip" data-html="true" title="<img class='wechat-qr' src='images/origin-wechat-qr.png' />"><i class="fab fa-weixin"></i> WeChat</span>
                    </li>
                  </ul>
                </div>
                <div className="col-4 col-md-3">
                  <div className="footer-header">
                    Social
                  </div>
                  <ul className="footer-links"> 
                    <li>
                      <a href="https://twitter.com/originprotocol" target="_blank"><i class="fab fa-twitter-square"></i> Twitter</a>
                    </li>
                    <li>
                      <a href="https://instagram.com/originprotocol" target="_blank"><i class="fab fa-instagram"></i> Instagram</a>
                    </li>
                    <li>
                      <a href="https://www.facebook.com/originprotocol" target="_blank"><i class="fab fa-facebook-square"></i> Facebook</a>
                    </li>
                    <li>
                      <a href="http://www.youtube.com/c/originprotocol" target="_blank"><i class="fab fa-youtube"></i> Youtube</a>
                    </li>
                  </ul>
                </div>
                <div className="col-4 col-md-3">
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
  componentDidMount() {
    $('[data-toggle="tooltip"]').tooltip()
  }
}



export default Footer
