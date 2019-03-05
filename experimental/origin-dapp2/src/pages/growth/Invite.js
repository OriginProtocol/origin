import React, { Component, Fragment } from 'react'
import Link from 'components/Link'
import { Query, Mutation } from 'react-apollo'
import inviteCodeQuery from 'queries/InviteCode'
import { formInput, formFeedback } from 'utils/formHelpers'
import InviteFriends from 'mutations/InviteFriends'

function NavigationItem(props) {
  const { selected, onClick, title } = props
  return (
    <a
      href="#"
      onClick={e => {
        e.preventDefault()
        onClick()
      }}
      className="pt-4 pr-4"
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
      inviteEmails: '',
      inviteEmailsConfirmation: false,
      inviteEmailsMutationError: false,
      showCopyConfirmation: false,
      valid: true
    }
  }

  getInviteCode() {
    return `${location.protocol}//${location.hostname}/#/welcome/${
      this.state.inviteCode
    }`
  }

  handleCopyClick() {
    const inviteField = document.getElementById('growth-invite-text')
    inviteField.value = this.getInviteCode()
    inviteField.select()
    document.execCommand('copy')
    inviteField.value = `${this.state.inviteCode}`
    this.setState({ showCopyConfirmation: true })
    // reset copy confirmation after 3 seconds
    setTimeout(() => {
      this.setState({ showCopyConfirmation: false })
    }, 5000)
  }

  handleNavigationClick(navigationState) {
    this.setState({ subPage: navigationState })
  }

  handleFbShareClick() {
    window.open(
      [
        'https://www.facebook.com/dialog/share?',
        'app_id=87741124305', // TODO use origin's one
        `&href=${this.getInviteCode()}`,
        '&display=popup',
        `&redirect_uri=${window.location.href}`
      ].join('')
    )
  }

  handleTwitterShareClick() {
    window.open('https://twitter.com/intent/tweet?text=')
  }

  resetEmailFormMessages(timeout = 5000) {
    setTimeout(() => {
      this.setState({
        inviteEmailsConfirmation: false,
        inviteEmailsMutationError: false,
      })
    }, timeout)
  }

  renderSendInvites() {
    const {
      showCopyConfirmation,
      inviteCode,
      inviteEmailsConfirmation,
      inviteEmailsMutationError
    } = this.state

    return (<Query
      query={inviteCodeQuery}
      onCompleted={({ inviteCode }) => {
        if (inviteCode !== this.state.inviteCode) {
          this.setState({ inviteCode })
        }
      }}
    >
      {({ loading, error, networkStatus }) => {
        if (networkStatus === 1 || loading) {
          return <h5 className="p-2">Loading...</h5>
        } else if (error) {
          return <QueryError error={error} query={inviteCodeQuery} />
        }

        const input = formInput(this.state, state => this.setState(state))
        const Feedback = formFeedback(this.state)

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
                    onClick={() => this.handleCopyClick()}
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
                    onClick={() => this.handleFbShareClick()}
                  >
                    <img src="/images/growth/facebook-icon.svg" />
                  </button>
                  <button
                    className="social-btn tw"
                    onClick={() => this.handleTwitterShareClick()}
                  >
                    <img src="/images/growth/twitter-icon.svg" />
                  </button>
                </div>
              </div>
            </div>

            <Mutation
              mutation={InviteFriends}
              onCompleted={({ invite }) => {
                if (invite) {
                  this.setState({
                    inviteEmailsConfirmation: `Total ${this.state.emails.length} Email invitation(s) sent!`
                  })
                } else {
                  this.setState({
                    inviteEmailsMutationError: 'Can not invite friends. Please try again later.'
                  })
                }
                this.resetEmailFormMessages()
              }}
              onError={errorData => {
                console.log('Error: ', errorData)
                this.setState({
                  inviteEmailsMutationError: 'Error inviting friends. Please try again later.'
                })
                this.resetEmailFormMessages()
              }}
            >
              {invite => (
                <form
                  onSubmit={e => {
                    e.preventDefault()
                    this.validateEmailsInput(invite)
                  }}
                >
                  <div className="empasis mt-5">Invite via Email</div>
                  <div>Enter email addresses of friends you want to invite</div>
                  <textarea
                    {...input('inviteEmails')}
                    className="email-text p-3"
                    cols="50"
                    rows="5"
                    placeholder="Separate email addresses with commas."
                  />
                  {Feedback('inviteEmails')}
                  {inviteEmailsConfirmation && <div
                    className="invite-confirmation"
                  >
                    {inviteEmailsConfirmation}
                  </div>}
                  {inviteEmailsMutationError && <div
                    className="invite-error"
                  >
                    {inviteEmailsMutationError}
                  </div>}
                  <button
                    className="btn btn-primary btn-rounded mt-2"
                    type="submit"
                    children="Invite Friends"
                  />
                </form>
              )}
            </Mutation>
          </div>
        )
      }}
    </Query>)
  }

  extractEmails(commaSeparatedEmails) {
    return commaSeparatedEmails
      .split(',')
      .map(email => email.trim().toLowerCase())
      .filter(email => email.length > 4)
  }

  validateEmailsInput(invite) {
    const newState = {
      valid: true
    }

    const emails = this.extractEmails(this.state.inviteEmails)

    var emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    const errorneousEmails = emails
      .filter(email => !emailRegex.test(email))
    

    if (errorneousEmails.length > 0) {
      newState.inviteEmailsError = `Incorrect email format: ${errorneousEmails.join(',')}`
      newState.valid = false 
    } else if (emails.length === 0) {
      newState.inviteEmailsError = 'Insert at least 1 valid email address'
      newState.valid = false 
    }
    
    newState.emails = emails 
    if (newState.valid) {
      invite({
        variables: { emails }
      })
    }

    this.setState(newState)
    return newState.valid
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
    max-width: 760px
  .growth-invite
    margin-top: 70px
    .back img
      width: 15px
      margin-right: 6px
      transform: rotate(270deg)
    .back
      font-weight: bold
      color: var(--clear-blue)
    .navigation-list 
      .select-bar
        background-color: var(--clear-blue)
        height: 4px
        width: 100%
      .title
        font-size: 0.88rem
        line-height: 1.93
        color: var(--bluey-grey)
        font-weight: normal
      .title.active
        color: var(--dark)
    .send-invites
      .empasis
        font-weight: bold
      .normal
        font-weight: normal
      .invite-code
        height: 50px
        border: 1px solid var(--light)
        border-radius: 5px 0px 0px 5px
        width: 68%
        color: var(--dark)
        font-weight: 300
        padding-left: 18px
      .copy-button
        height: 50px
        border: 1px solid var(--light)
        border-radius: 0px 5px 5px 0px
        width: 32%
        margin-left: -1px
        font-weight: normal
        cursor: pointer
      .copy-button:hover
        background-color: var(--pale-grey)
      .email-text
        width: 100%
        heigh: 140px
        border-radius: 5px
        border: 1px solid var(--light)
        resize: none
        margin-top: 12px
      .email-text::-webkit-input-placeholder
        font-weight: 300
        color: var(--steel)
      .btn
        font-weight: 18px
        padding-bottom: 10px
        padding-top: 10px
      .social-btn
        border-radius: 5px
        border: 1px solid var(--light)
        height: 50px
        width: 50%
      .social-btn.fb
        margin-right: 5px
      .social-btn.tw
        margin-left: 5px
      .social-btn:hover
        background-color: var(--pale-grey)
      .invite-confirmation
        font-size: 18px
      .invalid-feedback
        font-size: 18px
      .invite-error
        font-size: 18px
        color: var(--red)
`)
