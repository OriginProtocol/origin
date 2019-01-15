import React, { Component } from 'react'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'

import Dropdown from 'components/dropdown'

class NavigationDropdown extends Component {
  constructor() {
    super()
    this.state = { open: false }

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
    })

    this.handleBrowseCategories = this.handleBrowseCategories.bind(this)
  }

  toggle() {
    const open = !this.state.open
    this.setState({ open })
  }

  renderMenuButton(iconSrc, labelMessage, displayCaret, link, onClickCallback = null) {
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
      <div className="d-flex">
        <img src={iconSrc} />
        <div className="mr-auto menu-item">{intl.formatMessage(labelMessage)}</div>
        {displayCaret && <img className="nav-caret" src="images/caret-grey.svg" />}
      </div>
    </a>
  }

  handleBrowseCategories() {

  }

  render() {
    const { open } = this.state

    return (
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
              this.handleBrowseCategories
            )}
            {this.renderMenuButton('images/add-listing-icon-dark.svg', this.intlMessages.addListing, false, "/#/create")}
            <hr/>
            <div className="title">
              <FormattedMessage
                id={'navigation.myitems'}
                defaultMessage={'My Items'}
              />
            </div>
            {this.renderMenuButton('images/purchases-icon.svg', this.intlMessages.purchases, false, "/#/my-purchases")}
            {this.renderMenuButton('images/listings-icon.svg', this.intlMessages.listings, false, "/#/my-listings")}
            {this.renderMenuButton('images/sales-icon.svg', this.intlMessages.sales, false, "/#/my-sales")}
            <hr/>
            {this.renderMenuButton('images/chatbubble-icon.svg', this.intlMessages.messages, false, "/#/messages")}
            {this.renderMenuButton('images/alerts-icon-selected.svg', this.intlMessages.notifications, false, "/#/notifications")}
            {this.renderMenuButton('images/tx-icon.svg', this.intlMessages.transactions, false, "/#/transactions")}
          </div>
        </div>
      </Dropdown>
    )
  }
}

export default injectIntl(NavigationDropdown)
