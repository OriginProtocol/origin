const _ = require('lodash')
const fs = require('fs')
const templateDir = `${__dirname}/../templates`

// We use lodash templates.
// Docs: https://lodash.com/docs/4.17.11#template
// Codepen: https://codepen.io/matthewbeta/pen/ZGaYXW

const messageTemplates = {
  message: {
    mobile: {
      messageReceived: {
        title: _.template('New Origin Message from <%- senderName %>'),
        body: _.template(
          'You have received a message on Origin from <%- senderName %>.'
        )
      }
    },
    email: {
      messageReceived: {
        subject: _.template('New Origin Message from <%- senderName %>'),
        html: _.template(
          fs.readFileSync(`${templateDir}/MessageReceived.html`).toString()
        ),
        text: _.template(
          fs.readFileSync(`${templateDir}/MessageReceived.txt`).toString()
        )
      }
    }
  },
  seller: {
    mobile: {
      OfferCreated: {
        title: _.template('New Offer for <%= listing.title %>'),
        body: _.template(
          'A buyer has made an offer on your listing <%= listing.title %>'
        )
      },
      OfferWithdrawn: {
        title: _.template('Offer Withdrawn for <%= listing.title %>'),
        body: _.template(
          'An offer on your listing <%= listing.title %> has been withdrawn.'
        )
      },
      OfferDisputed: {
        title: _.template('Dispute Initiated for <%= listing.title %>'),
        body: _.template(
          'A problem has been reported with your transaction for <%= listing.title %>.'
        )
      },
      OfferRuling: {
        title: _.template('Dispute Resolved for <%= listing.title %>'),
        body: _.template(
          'A ruling has been issued on your disputed transaction for <%= listing.title %>.'
        )
      },
      OfferFinalized: {
        title: _.template('Sale Completed for <%= listing.title %>'),
        body: _.template(
          'Your transaction for <%= listing.title %> has been completed.'
        )
      }
    },
    email: {
      OfferCreated: {
        subject: _.template('New Offer for <%= listing.title %>'),
        html: _.template(
          fs.readFileSync(`${templateDir}/seller-OfferCreated.html`).toString()
        ),
        text: _.template(
          fs.readFileSync(`${templateDir}/seller-OfferCreated.txt`).toString()
        )
      },
      OfferWithdrawn: {
        subject: _.template('Offer Withdrawn for <%= listing.title %>'),
        html: _.template(
          fs
            .readFileSync(`${templateDir}/seller-OfferWithdrawn.html`)
            .toString()
        ),
        text: _.template(
          fs.readFileSync(`${templateDir}/seller-OfferWithdrawn.txt`).toString()
        )
      },
      OfferDisputed: {
        subject: _.template('Dispute Initiated for <%= listing.title %>'),
        html: _.template(
          fs.readFileSync(`${templateDir}/seller-OfferDisputed.html`).toString()
        ),
        text: _.template(
          fs.readFileSync(`${templateDir}/seller-OfferDisputed.txt`).toString()
        )
      },
      OfferRuling: {
        subject: _.template('Dispute Resolved for <%= listing.title %>'),
        html: _.template(
          fs.readFileSync(`${templateDir}/seller-OfferRuling.html`).toString()
        ),
        text: _.template(
          fs.readFileSync(`${templateDir}/seller-OfferRuling.txt`).toString()
        )
      },
      OfferFinalized: {
        subject: _.template('Sale Completed for <%= listing.title %>'),
        html: _.template(
          fs
            .readFileSync(`${templateDir}/seller-OfferFinalized.html`)
            .toString()
        ),
        text: _.template(
          fs.readFileSync(`${templateDir}/seller-OfferFinalized.txt`).toString()
        )
      }
    }
  },
  buyer: {
    mobile: {
      OfferWithdrawn: {
        title: _.template('Offer Rejected for <%= listing.title %>'),
        body: _.template(
          'An offer you made for <%= listing.title %> has been rejected.'
        )
      },
      OfferAccepted: {
        title: _.template('Offer Accepted for <%= listing.title %>'),
        body: _.template(
          'An offer you made for <%= listing.title %> has been accepted.'
        )
      },
      OfferDisputed: {
        title: _.template('Dispute Initiated for <%= listing.title %>'),
        body: _.template(
          'A problem has been reported with your transaction for <%= listing.title %>.'
        )
      },
      OfferRuling: {
        title: _.template('Dispute Resolved for <%= listing.title %>'),
        body: _.template(
          'A ruling has been issued on your disputed transaction for <%= listing.title %>.'
        )
      },
      OfferData: {
        title: _.template('New Review for <%= listing.title %>'),
        body: _.template(
          'A review has been left on your transaction for <%= listing.title %>.'
        )
      }
    },
    email: {
      OfferWithdrawn: {
        subject: _.template('Offer Rejected for <%= listing.title %>'),
        html: _.template(
          fs.readFileSync(`${templateDir}/buyer-OfferWithdrawn.html`).toString()
        ),
        text: _.template(
          fs.readFileSync(`${templateDir}/buyer-OfferWithdrawn.txt`).toString()
        )
      },
      OfferAccepted: {
        subject: _.template('Offer Accepted for <%= listing.title %>'),
        html: _.template(
          fs.readFileSync(`${templateDir}/buyer-OfferAccepted.html`).toString()
        ),
        text: _.template(
          fs.readFileSync(`${templateDir}/buyer-OfferAccepted.txt`).toString()
        )
      },
      OfferDisputed: {
        subject: _.template('Dispute Initiated for <%= listing.title %>'),
        html: _.template(
          fs.readFileSync(`${templateDir}/buyer-OfferDisputed.html`).toString()
        ),
        text: _.template(
          fs.readFileSync(`${templateDir}/buyer-OfferDisputed.txt`).toString()
        )
      },
      OfferRuling: {
        subject: _.template('Dispute Resolved for <%= listing.title %>'),
        html: _.template(
          fs.readFileSync(`${templateDir}/buyer-OfferRuling.html`).toString()
        ),
        text: _.template(
          fs.readFileSync(`${templateDir}/buyer-OfferRuling.txt`).toString()
        )
      },
      OfferData: {
        subject: _.template('New Review for <%= listing.title %>'),
        html: _.template(
          fs.readFileSync(`${templateDir}/buyer-OfferReview.html`).toString()
        ),
        text: _.template(
          fs.readFileSync(`${templateDir}/buyer-OfferReview.txt`).toString()
        )
      }
    }
  }
}

module.exports = { messageTemplates }
