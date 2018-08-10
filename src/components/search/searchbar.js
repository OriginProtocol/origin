import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'

import { storeWeb3Intent } from 'actions/App'

// import ConnectivityDropdown from 'components/dropdowns/connectivity'
// import MessagesDropdown from 'components/dropdowns/messages'
// import NotificationsDropdown from 'components/dropdowns/notifications'
// import TransactionsDropdown from 'components/dropdowns/transactions'
// import UserDropdown from 'components/dropdowns/user'
// import Modal from 'components/modal'

class SearchBar extends Component {
  constructor(props) {
    super(props)

    this.state = {
    }

    this.intlMessages = defineMessages({
      searchPlaceholder: {
        id: 'searchbar.search',
        defaultMessage: 'Search',
      },
    })
  }

  handleChange(e) {
    this.setState({ searchQuery: e.target.value })
  }

  render() {
    return (
      <nav className="searchbar saerchbar-dark">
       <div className="container d-flex flex-row">
          <div className="input-group mr-auto" id="search">
            <div className="input-group-prepend">
              <button className="btn btn-outline-secondary dropdown-toggle search-bar-prepend" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Dropdown</button>
              <div className="dropdown-menu">
                <a className="dropdown-item" href="#">Action</a>
                <a className="dropdown-item" href="#">Another action</a>
                <a className="dropdown-item" href="#">Something else here</a>
                <a className="dropdown-item" href="#">Separated link</a>
              </div>
            </div>
            <input type="text" className="form-control search-input" placeholder={this.props.intl.formatMessage(this.intlMessages.searchPlaceholder)} aria-label="Search"/>
            <div className="input-group-append">
              <span className="input-group-text search-bar-append">
                <img src="images/searchbar/magnifying-glass.svg" alt="Search Listings" />
              </span>
            </div>
          </div>

          <ul className="navbar-nav">
            <li className="nav-item active">
              <a className="nav-link" href="#">Home <span className="sr-only">(current)</span></a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">Link</a>
            </li>
            <li className="nav-item">
              <a className="nav-link disabled" href="#">Disabled</a>
            </li>
          </ul>
        </div>
      </nav>
    )
  }
}

const mapStateToProps = state => {
  return {
  }
}

const mapDispatchToProps = dispatch => ({
  
})

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(SearchBar))

