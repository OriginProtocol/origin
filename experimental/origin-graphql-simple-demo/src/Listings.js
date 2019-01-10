import React, { Component } from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";

import Buy from "./Buy";

const ListingsQuery = gql`
  {
    web3 {
      metaMaskEnabled
      metaMaskNetworkId
      metaMaskAccount {
        id
      }
    }
    marketplace {
      allListings {
        id
        title
        price {
          amount
          currency
        }
      }
    }
  }
`;

const Listings = () => (
  <Query query={ListingsQuery}>
    {({ loading, error, data }) => {
      if (loading) return "Loading..."
      if (error || !data) {
        console.log(error)
        return "Error"
      }
      console.log(data)
      return (
        <div>
          <h2>Origin Listings</h2>
          <table>
            <tbody>
              {data.marketplace.allListings.map((listing) => (
                <tr key={listing.id}>
                  <td>{`${listing.id}. ${listing.title}`}</td>
                  <td>{`${listing.price.amount} ${listing.price.currency}`}</td>
                  <td>
                    <Buy listing={listing} {...data.web3} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }}
  </Query>
);

export default Listings;
