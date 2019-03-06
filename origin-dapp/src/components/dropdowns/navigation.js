import React, { Component, Fragment } from 'react'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import { connect } from 'react-redux'

import origin from '../../services/origin'
import { formattedAddress } from 'utils/user'
import groupByArray from 'utils/groupByArray'
import Transaction from '../transaction'
import Dropdown from 'components/dropdown'
import listingSchemaMetadata from 'utils/listingSchemaMetadata'
import { getDerivedTransactionData } from 'utils/transaction'
import { selectListingType } from 'actions/Search'

class NavigationDropdown extends Component {
  constructor(props) {
    super()
    this.state = {
      open: false,
      categoriesOpen: false,
      transactionsOpen: false
    }

    this.listingTypes = [
      listingSchemaMetadata.listingTypeAll,
      ...listingSchemaMetadata.listingTypes
    ].map(listingType => {
      listingType.name = props.intl.formatMessage(listingType.translationName)
      return listingType
    })

    this.intlMessages = defineMessages({
      browseCategories: {
        id: 'navigation.browseCategories',
        defaultMessage: 'Browse Categories'
      },
      addListing: {
        id: 'navigation.addListing',
        defaultMessage: 'Add Listing'
      },
      sales: {
        id: 'navigation.sales',
        defaultMessage: 'Sales'
      },
      listings: {
        id: 'navigation.listings',
        defaultMessage: 'Listings'
      },
      purchases: {
        id: 'navigation.purchases',
        defaultMessage: 'Purchases'
      },
      messages: {
        id: 'navigation.messages',
        defaultMessage: 'Messages'
      },
      notifications: {
        id: 'navigation.notifications',
        defaultMessage: 'Notifications'
      },
      transactions: {
        id: 'navigation.transactions',
        defaultMessage: 'Transactions'
      },
      listingCategories: {
        id: 'navigation.listingCategories',
        defaultMessage: 'Listing Categories'
      },
      pendingTransactions: {
        id: 'navigation.pendingTransactions',
        defaultMessage: 'Pending Transactions'
      },
    })

    this.handleNavigateCategories = this.handleNavigateCategories.bind(this)
    this.handleOverlayBack = this.handleOverlayBack.bind(this)
    this.handleNavigateTransactions = this.handleNavigateTransactions.bind(this)
    this.handleCategoryClick = this.handleCategoryClick.bind(this)
  }

  toggle() {
    const open = !this.state.open
    this.setState({ open })
  }

  renderMenuButton(iconSrc, labelMessage, displayCaret, link, onClickCallback = null, injectedHtml = null) {
    const { intl } = this.props
    return <a
      href={link}
      className="navigation-menu-item"
      ga-category="top_mobile_nav"
      onClick={ e => {
        if (!link)
          e.preventDefault()

        this.toggle()
        if (onClickCallback !== null)
          onClickCallback()
      }}
    >
      {injectedHtml !== null && injectedHtml}
      <div className="d-flex">
        <img src={iconSrc} />
        <div className="mr-auto menu-item">{intl.formatMessage(labelMessage)}</div>
        {displayCaret && <img className="nav-caret" src="images/caret-grey.svg" />}
      </div>
    </a>
  }

  handleCategoryClick(listingType) {
    this.setState({
      categoriesOpen: false,
      open: false
    })

    document.location.href = `#/search?search_query=&listing_type=${listingType.type}`
    // select listing type and also trigger general search
    this.props.selectListingType(listingType)
  }

  handleNavigateCategories() {
    this.setState({ categoriesOpen: true })
  }

  handleNavigateTransactions() {
    this.setState({ transactionsOpen: true })
  }

  handleOverlayBack() {
    this.setState({
      categoriesOpen: false,
      transactionsOpen: false
    })
  }

  renderNavigationOverlay(title, content) {
    return (
      <div className="overlay-open">
        <div className="navigation-bar navbar navbar-dark">
          <div className="container d-flex justify-content-between">
            <a
              onClick={this.handleOverlayBack}
              className="p-3 col-2"
            >
              <img className="nav-caret" src="images/caret-white-thin.svg" />
            </a>
            <div className="col-8 title"><center>{title}</center></div>
            <div className="col-2"/>
          </div>
        </div>
        <div>
          {content}
        </div>
      </div>
    )
  }

  renderCategories() {
    return (<Fragment>
      {this.listingTypes.map(listingType => {
        return (
          <div
            key={listingType.name}
            className="category d-flex justify-content-between p-3 pr-4 mb-0"
            onClick={() => this.handleCategoryClick(listingType)}
          >
            <div>{listingType.name}</div>
            <img className="nav-caret" src="images/caret-grey.svg" />
          </div>)
      })}
    </Fragment>)
  }

  renderPendingTransactions(transactionsNotHidden, confirmationCompletionCount) {
    return (
    <div className="transactions-list">
      <ul className="list-group">
        {transactionsNotHidden.map(transaction => (
          <Transaction
            key={transaction.transactionHash}
            transaction={transaction}
            confirmationCompletionCount={confirmationCompletionCount}
          />
        ))}
      </ul>
    </div>)
  }

  render() {
    const { open, categoriesOpen, transactionsOpen } = this.state
    const { conversations, intl, transactions } = this.props
    const showConversationBubble = conversations.length > 0

    const {
      transactionsNotHidden,
      transactionsArePending,
      CONFIRMATION_COMPLETION_COUNT
    } = getDerivedTransactionData(transactions, [])


    return (
      <Fragment>
        {categoriesOpen && this.renderNavigationOverlay(
          intl.formatMessage(this.intlMessages.listingCategories),
          this.renderCategories()
        )}
        {transactionsOpen && this.renderNavigationOverlay(
          intl.formatMessage(this.intlMessages.pendingTransactions),
          this.renderPendingTransactions(transactionsNotHidden, CONFIRMATION_COMPLETION_COUNT)
        )}
        <Dropdown
          className="nav-item navigation d-flex d-lg-none"
          open={open}
          onClose={() => this.setState({ open: false })}
        >
          <a
            className="nav-link dropdown-toggle nav-menu"
            role="button"
            id="navigationDropdown"
            aria-haspopup="true"
            aria-expanded="false"
            ga-category="top_nav"
            ga-label="navigation_dropdown"
            onClick={() => this.toggle()}
          >
            <img src={open ? 'images/menu-icon-active.svg' : 'images/menu-icon.svg'} alt="Origin menu" />
            {(transactionsArePending || showConversationBubble)
              && <div className={ open ? `menu unread-indicator` : `menu unread-indicator dark`} />
            }
          </a>
          <div
            className={`dropdown-menu ${open ? ' show' : ''}`}
            aria-labelledby="navigationDropdown"
            onClick={e => {
              if (e.target.nodeName === 'A') this.setState({ open: false })
            }}
          >
            <div className="actual-menu d-flex flex-column">
              {this.renderMenuButton(
                'images/categories-icon.svg',
                this.intlMessages.browseCategories,
                true,
                undefined,
                this.handleNavigateCategories
              )}
              {this.renderMenuButton('images/add-listing-icon-dark.svg', this.intlMessages.addListing, false, '/#/create')}
              <hr/>
              <div className="title">
                <FormattedMessage
                  id={'navigation.myitems'}
                  defaultMessage={'My Items'}
                />
              </div>
              {this.renderMenuButton('images/purchases-icon.svg', this.intlMessages.purchases, false, '/#/my-purchases')}
              {this.renderMenuButton('images/listings-icon.svg', this.intlMessages.listings, false, '/#/my-listings')}
              {this.renderMenuButton('images/sales-icon.svg', this.intlMessages.sales, false, '/#/my-sales')}
              <hr/>
              {this.renderMenuButton(
                'images/chatbubble-icon.svg',
                this.intlMessages.messages,
                false,
                '/#/messages',
                null,
                showConversationBubble > 0 ? <div className="unread-indicator" /> : null
              )}
              {this.renderMenuButton('images/alerts-icon-selected.svg', this.intlMessages.notifications, false, '/#/notifications')}
              {this.renderMenuButton(
                'images/tx-icon.svg',
                this.intlMessages.transactions,
                true,
                undefined,
                this.handleNavigateTransactions,
                transactionsArePending ?
                  <div className="arrows-container">
                    <img
                      src="images/blue-circle-arrows.svg"
                      className="rotating-arrows"
                      alt="rotating circular arrows"
                    />
                  </div> :
                  null
              )}
            </div>
          </div>
        </Dropdown>
      </Fragment>
    )
  }
}

const mapStateToProps = ({ messages, wallet, transactions }) => {
  const filteredMessages = messages.filter(
    ({ content, conversationId, senderAddress, status }) => {
      return (
        content &&
        status === 'unread' &&
        formattedAddress(senderAddress) !== formattedAddress(wallet.address) &&
        origin.messaging.getRecipients(conversationId).includes(wallet.address)
      )
    }
  )

  return {
    conversations: groupByArray(filteredMessages, 'conversationId'),
    transactions: transactions
  }
}

const mapDispatchToProps = dispatch => ({
  selectListingType: listingType => dispatch(selectListingType(listingType))
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
  )(injectIntl(NavigationDropdown))
