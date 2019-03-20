import React from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'

import ListingQuery from 'queries/Listing'

function withListing(WrappedComponent) {
  const WithListing = props => {
    const listingId = props.match.params.listingID
    return (
      <Query query={ListingQuery} variables={{ listingId }}>
        {({ networkStatus, error, data }) => {
          const listing = get(data, 'marketplace.listing')
          return (
            <WrappedComponent
              {...props}
              {...{ networkStatus, error, listing }}
            />
          )
        }}
      </Query>
    )
  }
  return WithListing
}

export default withListing

// class Listing extends Component {
//
//   state = { quantity: '1' }
//
//   render() {
//     const listingId = this.props.match.params.listingID
//
//     return (
//       <Query query={ListingQuery} variables={{ listingId }}>
//         {({ networkStatus, error, data }) => {
//           if (networkStatus === 1) {
//             return <div>Loading...</div>
//           } else if (error) {
//             return <div>Error...</div>
//           } else if (!data || !data.marketplace) {
//             return <div>No marketplace contract?</div>
//           }
//
//           const listing = data.marketplace.listing
//           if (!listing) {
//             return <div>Listing not found</div>
//           }
//
//           return (
//             <ListingDetail
//               listing={listing}
//               quantity={this.state.quantity}
//               updateQuantity={quantity => this.setState({ quantity })}
//             />
//           )
//         }}
//       </Query>
//     )
//   }
// }
//
// export default Listing
