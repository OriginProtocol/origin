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

  render() {
    return (
      <footer className="dark-footer">
        <div className="container">
          <div className="row">
            <div className="col-12 col-md-5 col-lg-6">
              <div className="logo-container">
                <img
                  src="images/origin-logo.svg"
                  className="origin-logo"
                  alt="Origin Protocol"
                />
              </div>
              <p className="company-mission">
                <FormattedMessage
                  id={'footer.mission'}
                  defaultMessage={
                    'Origin is building the sharing economy of tomorrow. Buyers and sellers will be able to transact without rent-seeking middlemen. We believe in lowering transaction fees, promoting free and transparent commerce, and giving early participants in the community a stake in the network.'
                  }
                />
              </p>
              <p>&copy; {new Date().getFullYear()} Origin Protocol, Inc.</p>
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
            </div>
            <div className="col-12 col-md-7 col-lg-6">
              <div className="row">
                <div className="col-6 col-lg-3">
                  <div className="footer-header">
                    <FormattedMessage
                      id={'footer.documentationHeading'}
                      defaultMessage={'Resources'}
                    />
                  </div>
                  <ul className="footer-links">
                    <li>
                      <a
                        href={`https://www.originprotocol.com/${
                          this.state.companyWebsiteLanguageCode
                        }/product-brief`}
                      >
                        <FormattedMessage
                          id={'footer.productBriefLink'}
                          defaultMessage={'Product Brief'}
                        />
                      </a>
                    </li>
                    <li>
                      <a
                        href={`https://www.originprotocol.com/${
                          this.state.companyWebsiteLanguageCode
                        }/whitepaper`}
                      >
                        <FormattedMessage
                          id={'footer.whitepaperLink'}
                          defaultMessage={'Whitepaper'}
                        />
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://github.com/OriginProtocol"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FormattedMessage
                          id={'footer.githubLink'}
                          defaultMessage={'Github'}
                        />
                      </a>
                    </li>
                    <li>
                      <a
                        href="http://docs.originprotocol.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FormattedMessage
                          id={'footer.docsLink'}
                          defaultMessage={'Docs'}
                        />
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="col-6 col-lg-3">
                  <div className="footer-header">
                    <FormattedMessage
                      id={'footer.communityHeading'}
                      defaultMessage={'Community'}
                    />
                  </div>
                  <ul className="footer-links">
                    <li>
                      <a
                        href="https://t.me/originprotocol"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FormattedMessage
                          id={'footer.telegramLink'}
                          defaultMessage={'Telegram'}
                        />
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://discord.gg/jyxpUSe"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FormattedMessage
                          id={'footer.discordLink'}
                          defaultMessage={'Discord'}
                        />
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://medium.com/originprotocol"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FormattedMessage
                          id={'footer.mediumLink'}
                          defaultMessage={'Medium'}
                        />
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.reddit.com/r/originprotocol/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FormattedMessage
                          id={'footer.redditLink'}
                          defaultMessage={'Reddit'}
                        />
                      </a>
                    </li>
                    <li>
                      <a
                        className="span-link"
                        data-container="body"
                        data-toggle="tooltip"
                        title="<img class='weChat' src='/images/origin-wechat-qr.png' />"
                      >
                        <FormattedMessage
                          id={'footer.wechatLink'}
                          defaultMessage={'WeChat'}
                        />
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="col-6 col-lg-3">
                  <div className="footer-header">
                    <FormattedMessage
                      id={'footer.socialHeading'}
                      defaultMessage={'Social'}
                    />
                  </div>
                  <ul className="footer-links">
                    <li>
                      <a
                        href="https://twitter.com/originprotocol"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FormattedMessage
                          id={'footer.twitterLink'}
                          defaultMessage={'Twitter'}
                        />
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://instagram.com/originprotocol"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FormattedMessage
                          id={'footer.instagramLink'}
                          defaultMessage={'Instagram'}
                        />
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.facebook.com/originprotocol"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FormattedMessage
                          id={'footer.facebookLink'}
                          defaultMessage={'Facebook'}
                        />
                      </a>
                    </li>
                    <li>
                      <a
                        href="http://www.youtube.com/c/originprotocol"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FormattedMessage
                          id={'footer.youtubeLink'}
                          defaultMessage={'Youtube'}
                        />
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="col-6 col-lg-3">
                  <div className="footer-header">
                    <FormattedMessage
                      id={'footer.organizationHeading'}
                      defaultMessage={'Organization'}
                    />
                  </div>
                  <ul className="footer-links">
                    <li>
                      <a href="http://www.originprotocol.com/team">
                        <FormattedMessage
                          id={'footer.teamLink'}
                          defaultMessage={'Team'}
                        />
                      </a>
                    </li>
                    <li>
                      <a href="http://www.originprotocol.com/presale">
                        <FormattedMessage
                          id={'footer.presaleLink'}
                          defaultMessage={'Presale'}
                        />
                      </a>
                    </li>
                    <li>
                      <a href="http://www.originprotocol.com/partners">
                        <FormattedMessage
                          id={'footer.partnersLink'}
                          defaultMessage={'Partners'}
                        />
                      </a>
                    </li>
                    <li>
                      <a href="https://angel.co/originprotocol/jobs">
                        <FormattedMessage
                          id={'footer.hiringLink'}
                          defaultMessage={'Jobs'}
                        />
                      </a>
                    </li>
                    <li>
                      <a href="mailto:info@originprotocol.com">
                        info@originprotocol.com
                      </a>
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
}

const mapStateToProps = state => ({
  selectedLanguageCode: state.app.translations.selectedLanguageCode,
  selectedLanguageFull: state.app.translations.selectedLanguageFull,
  availableLanguages: state.app.translations.availableLanguages
})

export default connect(mapStateToProps)(Footer)
