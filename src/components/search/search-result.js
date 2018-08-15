import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'

import ListingsGrid from 'components/listings-grid'

class SearchResult extends Component {
  constructor(props) {
    super(props)
    this.state = {
    }

  }

  componentDidUpdate(prevProps) {
    // trigger another search result
  }

  render() {

    return (
      <div>
        <nav className="navbar search-filters navbar-expand-sm">
         <div className="container d-flex flex-row">
            <ul className="navbar-nav collapse navbar-collapse">
              <li className="nav-item active">
                <a className="nav-link" href="#">
                  <FormattedMessage
                    id={ 'search-result.categoryType' }
                    defaultMessage={ 'Category Type' }
                  />
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  <FormattedMessage
                    id={ 'search-result.dates' }
                    defaultMessage={ 'Dates' }
                  />
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  <FormattedMessage
                    id={ 'search-result.guests' }
                    defaultMessage={ 'Guests' }
                  />
                </a>
              </li>
            </ul>
          </div>
        </nav>
        <div className="container">
          <ListingsGrid renderMode='search' />
        </div>
      </div>
    )
  }
}

export default SearchResult
