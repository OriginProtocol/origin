import React, { Component, Fragment } from 'react'
import { withApollo, Query, Mutation } from 'react-apollo'
import { fbt } from 'fbt-runtime'
import { withRouter } from 'react-router-dom'

import Link from 'components/Link'
import QueryError from 'components/QueryError'
import inviteCodeQuery from 'queries/InviteCode'
import { formInput, formFeedback } from 'utils/formHelpers'
import InviteFriends from 'mutations/InviteFriends'
import InviteRemind from 'mutations/InviteRemind'
import MobileModalHeader from 'components/MobileModalHeader'
import LoadingSpinner from 'components/LoadingSpinner'

function NavigationItem(props) {
  const { selected, onClick, title, isMobile } = props
  return (
    <a
      href="#"
      onClick={e => {
        e.preventDefault()
        onClick()
      }}
      className="pt-4 pr-4 navigation-item"
    >
      <div className="d-flex flex-column align-items-center">
        <div
          className={`title ${isMobile ? 'px-3' : ''} ${
            selected ? 'active' : ''
          }`}
        >
          {title}
        </div>
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
    return `${location.protocol}//${location.hostname}/#/welcome/${this.state.inviteCode}`
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
    const text = fbt(
      'Join me on Origin and earn Origin cryptocurrency tokens (OGN). Origin is a new marketplace to buy and sell with other users. Earn Origin tokens when you create your profile, invite your friends, and buy and sell on the marketplace.',
      'RewardInvite.fbInvite'
    )
    window.open(
      [
        'https://www.facebook.com/dialog/share?',
        `app_id=${process.env.FACEBOOK_CLIENT_ID}`,
        `&href=${encodeURIComponent(this.getInviteCode())}`,
        `&quote=${encodeURIComponent(text)}`,
        '&display=popup',
        `&redirect_uri=${encodeURIComponent(window.location.href)}`
      ].join('')
    )
  }

  handleTwitterShareClick() {
    let text = fbt(
      'Join me on Origin and earn Origin cryptocurrency tokens (OGN). Origin is a new marketplace to buy and sell with other users. Earn Origin tokens when you create your profile, invite your friends, and buy and sell on the marketplace.',
      'RewardInvite.twitterInvite'
    )
    text += ' ' + this.getInviteCode()
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    )
  }

  resetEmailFormMessages(timeout = 5000) {
    setTimeout(() => {
      this.setState({
        inviteEmailsConfirmation: false,
        inviteEmailsMutationError: false
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

    const isMobile = this.props.isMobile

    return (
      <Query
        query={inviteCodeQuery}
        fetchPolicy="network-only"
        onCompleted={({ inviteCode }) => {
          if (inviteCode !== this.state.inviteCode) {
            this.setState({ inviteCode })
          }
        }}
      >
        {({ loading, error, networkStatus }) => {
          if (networkStatus === 1 || loading) {
            return <LoadingSpinner />
          } else if (error) {
            return <QueryError error={error} query={inviteCodeQuery} />
          }

          const input = formInput(this.state, state => this.setState(state))
          const Feedback = formFeedback(this.state)

          return (
            <div className="send-invites mt-4 pt-2">
              <div className="emphasis lesser-title">
                <fbt desc="RewardInvite.inviteWithYourCode">
                  Invite with your code
                </fbt>
              </div>
              <div>
                <fbt desc="RewardInvite.sendFriendInviteCode">
                  Send a friend your unique invitation code.
                </fbt>
              </div>

              <div className={`d-flex pt-3 ${isMobile ? 'flex-column' : ''}`}>
                <div className="col-12 col-md-8 pl-0 pr-0">
                  <div className="normal">
                    <fbt desc="RewardInvite.copyCode">Copy code</fbt>
                  </div>
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
                          <img src="images/growth/checkmark.svg" />
                          <div className="ml-2">
                            <fbt desc="RewardInvite.copied">Copied</fbt>
                          </div>
                        </Fragment>
                      )}
                      {!showCopyConfirmation && (
                        <div>
                          <fbt desc="RewardInvite.copyText">Copy</fbt>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-12 col-md-4 pl-0 pl-md-4 pr-0 mt-3 mt-md-0">
                  <div className="normal">
                    <fbt desc="RewardInvite.shareOrTweet">Share or Tweet</fbt>
                  </div>
                  <div className="d-flex mt-2">
                    <button
                      className="social-btn fb"
                      onClick={() => this.handleFbShareClick()}
                    >
                      <img src="images/growth/facebook-invite-icon.svg" />
                    </button>
                    <button
                      className="social-btn tw"
                      onClick={() => this.handleTwitterShareClick()}
                    >
                      <img src="images/growth/twitter-invite-icon.svg" />
                    </button>
                  </div>
                </div>
              </div>

              <Mutation
                mutation={InviteFriends}
                refetchQueries={[`GrowthCampaigns`]}
                onCompleted={({ invite }) => {
                  if (invite) {
                    this.setState({
                      inviteEmailsConfirmation: fbt(
                        'Total ' +
                          fbt.param('emailsLength', this.state.emails.length) +
                          ' Email invitation(s) sent!',
                        'RewardInvite.successEmailConfirmation'
                      ),
                      inviteEmails: ''
                    })
                  } else {
                    this.setState({
                      inviteEmailsMutationError: fbt(
                        'Can not invite friends. Please try again later.',
                        'RewardInvite.canNotSendEmails'
                      )
                    })
                  }
                  this.resetEmailFormMessages()
                }}
                onError={errorData => {
                  console.error('Error: ', errorData)
                  this.setState({
                    inviteEmailsMutationError: fbt(
                      'Error inviting friends. Please try again later.',
                      'RewardInvite.errorInviting'
                    )
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
                    <div className="emphasis lesser-title mt-md-5 mt-4">
                      <fbt desc="RewardInvite.inviteViaEmail">
                        Invite via Email
                      </fbt>
                    </div>
                    <div>
                      <fbt desc="RewardInvite.enterEmailAddresses">
                        Enter email addresses of friends you want to invite
                      </fbt>
                    </div>
                    <textarea
                      {...input('inviteEmails')}
                      className="email-text p-3"
                      cols="50"
                      rows="5"
                      placeholder={fbt(
                        'Separate email addresses with commas.',
                        'RewardInvite.separateEmailsWithCommas'
                      )}
                    />
                    {Feedback('inviteEmails')}
                    {inviteEmailsConfirmation && (
                      <div className="invite-confirmation">
                        {inviteEmailsConfirmation}
                      </div>
                    )}
                    {inviteEmailsMutationError && (
                      <div className="invite-error">
                        {inviteEmailsMutationError}
                      </div>
                    )}
                    <button
                      className="btn btn-primary btn-rounded mt-2"
                      type="submit"
                      children={fbt(
                        'Invite Friends',
                        'RewardInvite.inviteFriends'
                      )}
                    />
                  </form>
                )}
              </Mutation>
            </div>
          )
        }}
      </Query>
    )
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

    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    const errorneousEmails = emails.filter(email => !emailRegex.test(email))

    if (errorneousEmails.length > 0) {
      newState.inviteEmailsError = fbt(
        'Incorrect email format: ' +
          fbt.param('errorEmails', errorneousEmails.join(',')),
        'RewardInvite.incorrectEmailsError'
      )
      newState.valid = false
    } else if (emails.length === 0) {
      newState.inviteEmailsError = fbt(
        'Insert at least 1 valid email address',
        'RewardInvite.enterOneValidEmail'
      )
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

  setButtonTextWithDelay(button, text, delay) {
    setTimeout(() => {
      button.innerHTML = text
    }, delay)
  }

  async handleRemindClick(inviteId, e) {
    const button = e.target
    const mutationResult = await this.props.client.mutate({
      mutation: InviteRemind,
      variables: {
        invitationId: parseInt(inviteId)
      }
    })

    const wasSuccessful = mutationResult.data.inviteRemind
    if (wasSuccessful) {
      button.innerHTML = fbt('Reminder sent!', 'RewardInvite.reminderSent')
    } else {
      button.innerHTML = fbt('Error', 'RewardInvite.reminderSentError')
    }

    this.setButtonTextWithDelay(
      button,
      fbt('Remind', 'RewardInvite.remindText'),
      2500
    )
  }

  renderTrackInvites(referralAction, isMobile) {
    const formatTokens = tokenAmount => {
      return web3.utils
        .toBN(tokenAmount)
        .div(this.props.decimalDivision)
        .toString()
    }

    const renderReward = (amount, renderPlusSign, isBig = false) => {
      return (
        <div
          className={`reward ${
            isBig ? 'big' : ''
          } d-flex align-items-center mt-1`}
        >
          <img src="images/ogn-icon.svg" />
          <div className={`value ${isBig ? 'ml-2' : 'ml-1'}`}>
            {renderPlusSign ? '+' : ''}
            {formatTokens(amount)}
          </div>
        </div>
      )
    }

    const renderInvitesTable = (
      title,
      invites,
      reward,
      rewardTitle,
      emptyText,
      showStatus,
      showRemindButton
    ) => {
      return (
        <div className="track-invites">
          <div className="pt-2 d-flex justify-content-between">
            <div className="emphasis">{title}</div>
            <div
              className={`reward-holder d-flex flex-column ${
                isMobile ? 'align-items-start' : 'align-items-center'
              } `}
            >
              {renderReward(reward, false, true)}
              <div>{rewardTitle}</div>
            </div>
          </div>
          {invites.length == 0 && (
            <div className="explanation">{emptyText}</div>
          )}
          {invites.length > 0 && (
            <div className="mt-3">
              <div className="normal-font d-flex pb-2">
                <div className={`${isMobile ? 'col-6' : 'col-4'} p-0`}>
                  <fbt desc="RewardInvite.contact">Contact</fbt>
                </div>
                <div className="col-2 p-0">
                  <fbt desc="RewardInvite.invite">Reward</fbt>
                </div>
                <div className={`${isMobile ? 'col-4' : 'col-6'} p-0`}>
                  {showStatus ? fbt('Status', 'RewardInvite.status') : ''}
                </div>
              </div>
              {invites.map(invite => {
                const name = invite.contact
                  ? invite.contact
                  : invite.walletAddress
                return (
                  <div
                    className="invite-row d-flex pt-2 pb-2"
                    key={invite.pendingId}
                  >
                    <div
                      className={`${
                        isMobile ? 'col-6' : 'col-4'
                      } p-0 d-flex align-items-center`}
                    >
                      <div className="name">{name}</div>
                    </div>
                    <div className="col-2 p-0 d-flex">
                      {renderReward(invite.reward.amount, false, false)}
                    </div>
                    <div
                      className={`${
                        isMobile ? 'col-4' : 'col-6'
                      } p-0 d-flex justify-content-between align-items-center`}
                    >
                      <div>
                        {showStatus
                          ? fbt(
                              'Hasn’t completed user activation',
                              'RewardInvite.hasntCompletedActivation'
                            )
                          : ''}
                      </div>
                      <div className="pr-3">
                        {showRemindButton && (
                          <button
                            className="remind-button"
                            onClick={async e =>
                              await this.handleRemindClick(invite.pendingId, e)
                            }
                            children={fbt('Remind', 'RewardInvite.remind')}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )
    }

    return (
      <Fragment>
        {renderInvitesTable(
          fbt('Pending Invitations', 'RewardInvite.pendingInvitations'),
          referralAction.invites.nodes.filter(
            invite => invite.status !== 'Completed'
          ),
          referralAction.rewardPending.amount,
          fbt('Pending', 'RewardInvite.pendingTitle'),
          fbt(
            'You have no pending invitations.',
            'RewardInvite.noPendingInvitations'
          ),
          !isMobile,
          true
        )}
        <div className="mt-5" />
        {renderInvitesTable(
          fbt('Successful Invitations', 'RewardInvite.successfulInvitations'),
          referralAction.invites.nodes.filter(
            invite => invite.status === 'Completed'
          ),
          referralAction.rewardEarned.amount,
          fbt('Earned', 'RewardInvite.earnedTitle'),
          fbt(
            'You have no successful invitations.',
            'RewardInvite.noSuccessfulInvitations'
          ),
          false,
          false
        )}
      </Fragment>
    )
  }

  render() {
    const { subPage } = this.state
    const { activeCampaign, isMobile } = this.props

    const referralAction = activeCampaign.actions.filter(
      action => action.type === 'Referral'
    )[0]

    return (
      <Fragment>
        {isMobile && (
          <MobileModalHeader
            showBackButton={true}
            className="px-0"
            onBack={() => {
              this.props.history.push('/campaigns')
            }}
          >
            <fbt desc="RewardInvite.invite">Invitations</fbt>
          </MobileModalHeader>
        )}
        <div className={`container growth-invite ${isMobile ? 'mobile' : ''}`}>
          <div>
            {!isMobile && (
              <Fragment>
                <Link className="back d-flex mr-auto" to="/campaigns">
                  <img src="images/caret-blue.svg" />
                  <div>
                    <fbt desc="RewardInvite.backToCampaign">
                      Back to Campaign
                    </fbt>
                  </div>
                </Link>
                <h1 className={`mb-2 pt-md-3 mt-3`}>
                  <fbt desc="RewardInvite.inviteYourFriends">
                    Invite your friends to Origin
                  </fbt>
                </h1>
              </Fragment>
            )}
            <div
              className={`invites-subtitle ${isMobile ? 'text-center' : ''}`}
            >
              <fbt desc="RewardInvite.getOgnByGettingFriendsToSignUp">
                Invite friends and earn Origin Tokens when they sign up and
                create profiles.
              </fbt>
            </div>
          </div>

          <div
            className={`navigation-list ${
              isMobile ? 'justify-content-center' : 'justify-content-left'
            } d-flex mt-1 mt-md-4`}
          >
            <NavigationItem
              selected={subPage === 'sendInvites'}
              onClick={() => this.handleNavigationClick('sendInvites')}
              title={fbt('Send Invitations', 'RewardInvite.sendInvitations')}
              isMobile={isMobile}
            />
            <NavigationItem
              selected={subPage === 'trackInvites'}
              onClick={() => this.handleNavigationClick('trackInvites')}
              title={fbt('Track Invitations', 'RewardInvite.trackInvitations')}
              isMobile={isMobile}
            />
          </div>
          {subPage === 'sendInvites' && this.renderSendInvites()}
          {subPage === 'trackInvites' &&
            this.renderTrackInvites(referralAction, isMobile)}
        </div>
      </Fragment>
    )
  }
}

export default withRouter(withApollo(GrowthInvite))

require('react-styl')(`
  .growth-invite.container
    max-width: 760px
  .growth-invite
    margin-top: 70px
    .normal-font
      font-weight: normal
    .navigation-item
      .title
        font-size: 14px
        line-height: 1.93
        color: var(--bluey-grey)
        font-weight: normal
        white-space: nowrap
      .title.active
        color: var(--dark)
    .invites-subtitle
      font-size: 16px
    .back
      font-weight: bold
      color: var(--clear-blue)
      cursor: pointer
      font-size: 14px
      margin-top: 70px
    .back img
      width: 15px
      margin-right: 6px
      transform: rotate(270deg)
    .navigation-list
      .select-bar
        background-color: var(--clear-blue)
        height: 4px
        width: 100%
      .title
        font-size: 14px
        line-height: 1.93
        color: var(--bluey-grey)
        font-weight: normal
      .title.active
        color: var(--dark)
    .send-invites
      .emphasis
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
        height: 140px
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
        background-color: white
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
    .track-invites
      margin-top: 30px
      .emphasis
        font-weight: bold
      .reward-holder
        margin-top: -20px
        font-size: 14px
        font-weight: normal
      .reward
        font-size: 14px
        font-weight: bold
        color: var(--clear-blue)
      .reward .value
        padding-bottom: 1px
      .reward img
        width: 19px
      .reward.big
        font-size:22px
      .reward.big .value
        padding-bottom: 1px
      .reward.big img
        width: 24px
      .invite-row
        border-top: 1px solid var(--pale-grey-two)
      .name
        text-overflow: ellipsis
        overflow: hidden
        white-space: nowrap
        max-width: 95%
      .remind-button
        border: 0px
        color: var(--clear-blue)
        background-color: white
  .growth-invite.mobile
    font-size: 16px
    margin-top: 1rem
    h1
      font-size: 26px !important
    .invite-error
        font-size: 16px
    .btn-primary
      width: 100%
    .lesser-title
      font-size: 18px
    .reward.big
      margin-bottom: -5px
    .social-btn
      border-radius: 25px
      border: solid 1px #007fff
    .track-invites
      margin-top: 35px
      .reward.big
        font-size: 18px
        height: 2rem
        padding-right: 0.75rem
        img
          width: 1.25rem
`)
