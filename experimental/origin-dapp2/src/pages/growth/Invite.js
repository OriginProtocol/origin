import React, { Component, Fragment } from 'react'
import Link from 'components/Link'

function NavigationItem(props) {
  const { selected, onClick, title } = props
  return (
    <a
      href="#"
      onClick={e => {
        e.preventDefault()
        onClick()
      }}
      className="pt-4 pb-43 pr-4"
    >
      <div className="d-flex flex-column align-items-center">
        <div className={`title ${selected ? 'active' : ''}`}>{title}</div>
        {selected && <div className="select-bar" />}
      </div>
    </a>
  )
}

class GrowthInvite extends Component {
  constructor(props) {
    super(props)
    this.state = {
      subPage: 'sendInvites',
      inviteCode: 'origin-invite-code',
      showCopyConfirmation: false
    }

    this.inviteCode = `${location.protocol}//${location.hostname}/#/welcome/${
      this.state.inviteCode
    }`

    this.handleNavigationClick = this.handleNavigationClick.bind(this)
    this.renderSendInvites = this.renderSendInvites.bind(this)
    this.renderTrackInvites = this.renderTrackInvites.bind(this)
    this.handleCopyClick = this.handleCopyClick.bind(this)
    this.handleFbShareClick = this.handleFbShareClick.bind(this)
  }

  handleCopyClick(e) {
    const inviteField = document.getElementById('growth-invite-text')
    inviteField.value = this.inviteCode
    inviteField.select()
    document.execCommand('copy')
    inviteField.value = `${this.state.inviteCode}`
    this.setState({ showCopyConfirmation: true })
    // reset copy confirmation after 3 seconds
    setTimeout(() => {
      this.setState({ showCopyConfirmation: false })
    }, 3000)
  }

  handleNavigationClick(navigationState) {
    this.setState({ subPage: navigationState })
  }

  handleFbShareClick() {
    window.open(
      [
        'https://www.facebook.com/dialog/share?',
        'app_id=87741124305', // TODO use origin's one
        `&href=${this.inviteCode}`,
        '&display=popup',
        `&redirect_uri=${window.location.href}`
      ].join('')
    )
  }

  handleFbShareClick() {
    window.open('https://twitter.com/intent/tweet?text=')
  }

  renderSendInvites() {
    const { showCopyConfirmation, inviteCode } = this.state
    return (
      <div className="send-invites mt-4 pt-2">
        <div className="empasis">Invite with your code</div>
        <div>Send your friend your unique invite code.</div>

        <div className="d-flex pt-3">
          <div className="col-8 pl-0 pr-0">
            <div className="normal">Copy code</div>
            <div className="d-flex mt-2">
              <input
                id="growth-invite-text"
                type="text"
                className="invite-code"
                value={inviteCode}
                readOnly
              />
              <div
                className="copy-button d-flex align-items-center justify-content-center"
                onClick={this.handleCopyClick}
              >
                {showCopyConfirmation && (
                  <Fragment>
                    <img src="/images/growth/checkmark.svg" />
                    <div className="ml-2">Copied</div>
                  </Fragment>
                )}
                {!showCopyConfirmation && <div>Copy</div>}
              </div>
            </div>
          </div>
          <div className="col-4 pl-4 pr-0">
            <div className="normal">Share or Tweet</div>
            <div className="d-flex mt-2">
              <button
                className="social-btn fb"
                onClick={this.handleFbShareClick}
              >
                <img src="/images/growth/facebook-icon.svg" />
              </button>
              <button className="social-btn tw">
                <img src="/images/growth/twitter-icon.svg" />
              </button>
            </div>
          </div>
        </div>

        <div className="empasis mt-5">Invite via Email</div>
        <div>Enter email addresses of friends you want to invite</div>
        <textarea
          name="invite-email"
          className="email-text p-3"
          cols="50"
          rows="5"
          placeholder="Separate email addresses with commas."
        />
        <button
          className="btn btn-primary btn-rounded mt-2"
          children="Invite Friends"
        />
      </div>
    )
  }

  renderTrackInvites() {
    return <div />
  }

  render() {
    const { subPage } = this.state
    return (
      <div className="container growth-invite">
        <div>
          <Link to="/campaigns" className="back d-flex mr-auto">
            <img src="/images/caret-blue.svg" />
            <div>Back to Campaign</div>
          </Link>
          <h1 className="mb-2 pt-3 mt-3">Invite your friends to Origin</h1>
          <div>Get Origin Tokens by completing the tasks below.</div>
        </div>

        <div className="navigation-list d-flex justify-content-left mt-4">
          <NavigationItem
            selected={subPage === 'sendInvites'}
            onClick={() => this.handleNavigationClick('sendInvites')}
            title={`Send Invites`.toUpperCase()}
          />
          <NavigationItem
            selected={subPage === 'trackInvites'}
            onClick={() => this.handleNavigationClick('trackInvites')}
            title={`Track Invites`.toUpperCase()}
          />
        </div>
        {subPage === 'sendInvites' && this.renderSendInvites()}
        {subPage === 'trackInvites' && this.renderTrackInvites()}
      </div>
    )
  }
}

export default GrowthInvite

require('react-styl')(`
  .growth-invite.container
    max-width: 760px;
  .growth-invite
    margin-top: 70px;
    .back img
      width: 15px;
      margin-right: 6px;
      -webkit-transform: rotate(270deg);
      transform: rotate(270deg);
    .back
      font-weight: bold;
      color: var(--clear-blue);
    .navigation-list 
      .select-bar
        background-color: var(--clear-blue);
        height: 4px;
        width: 100%;
      .title
        font-size: 0.88rem;
        line-height: 1.93;
        color: var(--bluey-grey);
        font-weight: normal;
      .title.active
        color: var(--dark);
    .send-invites
      .empasis
        font-weight: bold;
      .normal
        font-weight: normal;
      .invite-code
        height: 50px;
        border: 1px solid var(--light);
        border-radius: 5px 0px 0px 5px;
        width: 68%;
        color: var(--dark);
        font-weight: 300;
        padding-left: 18px;
      .copy-button
        height: 50px;
        border: 1px solid var(--light);
        border-radius: 0px 5px 5px 0px;
        width: 32%;
        margin-left: -1px;
        font-weight: normal;
        cursor: pointer;
      .copy-button:hover
        background-color: var(--pale-grey)
      .email-text
        width: 100%;
        heigh: 140px;
        border-radius: 5px;
        border: 1px solid var(--light);
        resize: none;
        margin-top: 12px;
      .email-text::-webkit-input-placeholder
        font-weight: 300;
        color: var(--steel);
      .btn
        font-weight: 18px;
        padding-bottom: 10px;
        padding-top: 10px;
      .social-btn
        border-radius: 5px;
        border: 1px solid var(--light);
        height: 50px;
        width: 50%;
      .social-btn.fb
        margin-right: 5px;
      .social-btn.tw
        margin-left: 5px;
      .social-btn:hover
        background-color: var(--pale-grey)
`)
