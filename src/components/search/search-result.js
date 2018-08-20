import React, { Component } from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { searchListings } from 'actions/Listing'

import ListingsGrid from 'components/listings-grid'

class SearchResult extends Component {
  constructor(props) {
    super(props)
    this.state = {
    }

    this.listingSearchSchema = [
      {
        title: 'schema.all.title',
        type: 'all',
        filters: [
          // {
          //   "title": "schema.forSale.category",
          //   "type": "null"
          // }
          {
            "title": "Category"
          },
          {
            "title": "Price"
          }
        ]
      },
      {
        type: 'for-sale',
        filters: [
          {
            "title": "Category"
          },
          {
            "title": "Price"
          }
        ]
      },
      {
        type: 'housing',
        filters: [
          {
            "title": "Category"
          },
          {
            "title": "Price"
          },
          {
            "title": "Guests"
          },
          {
            "title": "Rooms"
          },
          {
            "title": "Home Type"
          }
        ]
      },
      {
        type: 'transportation',
        filters: [
          {
            "title": "Category"
          },
          {
            "title": "Price"
          }
        ]
      },
      {
        type: 'tickets',
        filters: [
          {
            "title": "Category"
          },
          {
            "title": "Price"
          }
        ]
      },
      {
        type: 'services',
        filters: [
          {
            "title": "Category"
          },
          {
            "title": "Price"
          }
        ]
      },
      {
        type: 'announcements',
        filters: [
          {
            "title": "Category"
          },
          {
            "title": "Price"
          }
        ]
      }
    ]
  }

  componentDidUpdate(prevProps) {
    //this.props.searchListings(this.state.searchQuery)
  }

  render() {
    return (
      <div>
        <nav className="navbar search-filters navbar-expand-sm">
         <div className="container d-flex flex-row">
            <ul className="navbar-nav collapse navbar-collapse">
              {
                this.listingSearchSchema
                  .find(listingItem => listingItem.type === this.props.listingType)
                  .filters
                  .map(filter => 
                    <li className="nav-item">
                      <a className="nav-link" href="#">
                        {filter.title}
                      </a>
                    </li>
                  )
              }
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

const mapStateToProps = state => ({
  listingType: state.search.listingType
})

const mapDispatchToProps = dispatch => ({
  searchListings: (query) => dispatch(searchListings(query))
})

export default connect(mapStateToProps, mapDispatchToProps)(SearchResult)
