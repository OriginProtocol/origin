const _ = require('lodash')

// We use lodash templates.
// Docs: https://lodash.com/docs/4.17.11#template
// Codepen: https://codepen.io/matthewbeta/pen/ZGaYXW

const messageTemplates = {
  seller: {
    mobile: {
      OfferCreated: {
        title: 'New Offer',
        body: 'A buyer has made an offer on your listing.'
      },
      OfferWithdrawn: {
        title: 'Offer Withdrawn',
        body: 'An offer on your listing has been withdrawn.'
      },
      OfferDisputed: {
        title: 'Dispute Initiated',
        body: 'A problem has been reported with your transaction.'
      },
      OfferRuling: {
        title: 'Dispute Resolved',
        body: 'A ruling has been issued on your disputed transaction.'
      },
      OfferFinalized: {
        title: 'Sale Completed',
        body: 'Your transaction has been completed.'
      }
    },
    email: {
      OfferCreated: {
        subject: 'New Offer',
        html: _.template(
          `
          A buyer (<em><%- offer.buyer.identity.fullName %></em>) has made an offer on your listing <em><%= listing.title %></em>.

          <% if (listing.media[0]) { %>
          <img class="listing-img" src="https://ipfs.originprotocol.com/ipfs/<%- listing.media[0].url.slice(7,53) %>"/>
          <% } %>
          `
        ),
        text: _.template('A buyer has made an offer on your listing.')
      },
      OfferWithdrawn: {
        subject: 'Offer Withdrawn',
        html: _.template(
          `
          The buyer <em><%- offer.buyer.identity.fullName %></em> has withdrawn their offer on your listing <em><%= listing.title %></em>.

          <% if (listing.media[0]) { %>
          <img class="listing-img" src="https://ipfs.originprotocol.com/ipfs/<%- listing.media[0].url.slice(7,53) %>"/>
          <% } %>
          `
        ),
        text: _.template('An offer on your listing has been withdrawn.')
      },
      OfferDisputed: {
        subject: 'Dispute Initiated',
        html: _.template('A problem has been reported with your transaction.'),
        text: _.template('A problem has been reported with your transaction.')
      },
      OfferRuling: {
        subject: 'Dispute Resolved',
        html: _.template(
          'A ruling has been issued on your disputed transaction.'
        ),
        text: _.template(
          'A ruling has been issued on your disputed transaction.'
        )
      },
      OfferFinalized: {
        subject: 'Sale Completed',
        html: _.template(
          `
          Your transaction with <em><%- offer.buyer.identity.fullName %></em> for
          <em><%= listing.title %></em> has been completed.


          <% if (listing.media[0]) { %>
          <img class="listing-img" src="https://ipfs.originprotocol.com/ipfs/<%- listing.media[0].url.slice(7,53) %>"/>
          <% } %>
          `
        ),
        text: _.template(
          'Your transaction with "<%= offer.buyer.identity.fullName %>" for "<%= listing.title %>" has been completed.'
        )
      }
    }
  },
  buyer: {
    mobile: {
      OfferWithdrawn: {
        title: 'Offer Rejected',
        body: 'An offer you made has been rejected.'
      },
      OfferAccepted: {
        title: 'Offer Accepted',
        body: 'An offer you made has been accepted.'
      },
      OfferDisputed: {
        title: 'Dispute Initiated',
        body: 'A problem has been reported with your transaction.'
      },
      OfferRuling: {
        title: 'Dispute Resolved',
        body: 'A ruling has been issued on your disputed transaction.'
      },
      OfferData: {
        title: 'New Review',
        body: 'A review has been left on your transaction.'
      }
    },
    email: {
      OfferWithdrawn: {
        subject: 'Offer Rejected',
        html: _.template('An offer you made has been rejected.'),
        text: _.template('An offer you made has been rejected.')
      },
      OfferAccepted: {
        subject: 'Offer Accepted',
        html: _.template('An offer you made has been accepted.'),
        text: _.template('An offer you made has been accepted.')
      },
      OfferDisputed: {
        subject: 'Dispute Initiated',
        html: _.template('A problem has been reported with your transaction.'),
        text: _.template('A problem has been reported with your transaction.')
      },
      OfferRuling: {
        subject: 'Dispute Resolved',
        html: _.template(
          'A ruling has been issued on your disputed transaction.'
        ),
        text: _.template(
          'A ruling has been issued on your disputed transaction.'
        )
      },
      OfferData: {
        subject: 'New Review',
        html: _.template('A review has been left on your transaction.'),
        text: _.template('A review has been left on your transaction.')
      }
    }
  }
}

module.exports = { messageTemplates }
