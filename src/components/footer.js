import React, { Component } from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import localeCode from 'locale-code'
import store from 'store'
import $ from 'jquery'

class Footer extends Component {
  constructor(props) {
    super(props)

    this.state = {
      companyWebsiteLanguageCode: 'en-US'
    }

    this.localizeApp = this.localizeApp.bind(this)
    this.localizeWhitepaperUrl = this.localizeWhitepaperUrl.bind(this)
  }

  componentDidMount() {
    this.localizeWhitepaperUrl()

    $('[data-toggle="tooltip"]').tooltip({
      html: true
    })
  }

  localizeApp(langCode) {
    if (langCode !== this.props.selectedLanguageCode) {
      store.set('preferredLang', langCode)
      window.location.reload()
    }
  }

  localizeWhitepaperUrl() {
    const { selectedLanguageCode: langCode } = this.props
    let companyWebsiteLanguageCode

    switch (langCode) {
    case 'zh-CN':
      companyWebsiteLanguageCode = 'zh_Hans'
      break
    case 'zh-TW':
      companyWebsiteLanguageCode = 'zh_Hant'
      break
    default:
      companyWebsiteLanguageCode = localeCode.getLanguageCode(langCode)
    }

    this.setState({ companyWebsiteLanguageCode })
  }

  componentWillUnmount() {
    $('[data-toggle="tooltip"]').tooltip('dispose')
  }

  render() {
    return (
      <footer className="light-footer">
        <div className="container">
          <div className="row">
            <div className="col-12 col-md-5 col-lg-6">
              <div className="logo-container">
                <a href="https://www.originprotocol.com">
                  <img
                    src="images/origin-logo-footer.svg"
                    className="origin-logo"
                    alt="Origin Protocol"
                  />
                </a>
                <div className="vl"></div>
                <div className="company-mission">
                  <p>
                    <FormattedMessage
                      id={'footer.mission'}
                      defaultMessage={
                        'The Origin Decentralized App runs on Ethereum Mainnet and uses real ETH. Use caution with counterparties you don\'t know. Please verify your own identity.'
                      }
                    />
                  </p>
                  <p>&copy; {new Date().getFullYear()} Origin Protocol, Inc.</p>
                </div>
              </div> 
            </div>
            <div className="col-12 col-md-7 col-lg-6">
              <div className="footer-links-container">
                <div className="dropdown">
                  <a
                    className="dropdown-toggle"
                    id="languageDropdown"
                    role="button"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    {this.props.selectedLanguageFull}
                  </a>
                  <div
                    className="dropdown-menu dropdown-menu-left"
                    aria-labelledby="languageDropdown"
                  >
                    <div className="triangle-container d-flex justify-content-end">
                      <div className="triangle" />
                    </div>
                    <div className="actual-menu">
                      <div className="language-list">
                        <ul className="list-group">
                          <li
                            className="language d-flex flex-wrap"
                            onClick={() => {
                              this.localizeApp('en-US')
                            }}
                            data-locale="en-US"
                          >
                            English
                          </li>
                          {this.props.availableLanguages &&
                            this.props.availableLanguages.map(langObj => (
                              <li
                                className="language d-flex flex-wrap"
                                key={langObj.selectedLanguageCode}
                                onClick={() => {
                                  this.localizeApp(langObj.selectedLanguageCode)
                                }}
                                data-locale={langObj.selectedLanguageCode}
                              >
                                {langObj.selectedLanguageFull}
                              </li>
                            ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <a
                  href="https://www.originprotocol.com"
                  className="footer-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FormattedMessage
                    id={'footer.websiteLink'}
                    defaultMessage={'Visit our Website'}
                  />
                </a>
                <a
                  href="https://github.com/OriginProtocol"
                  className="footer-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FormattedMessage
                    id={'footer.githubLink'}
                    defaultMessage={'Visit our Github'}
                  />
                </a>
                {/* For when the FAQ page is ready
                <a
                  href="/FAQ"
                  className="footer-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FormattedMessage
                    id={'footer.faqLink'}
                    defaultMessage={'View FAQs'}
                  />
                </a> */}
              </div>
            </div>
          </div>
        </div>
      </footer>
    )
  }
}

const mapStateToProps = state => ({
  selectedLanguageCode: state.app.translations.selectedLanguageCode,
  selectedLanguageFull: state.app.translations.selectedLanguageFull,
  availableLanguages: state.app.translations.availableLanguages
})

export default connect(mapStateToProps)(Footer)
