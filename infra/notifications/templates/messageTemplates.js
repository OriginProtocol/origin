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
        title: 'New Origin Message',
        body: 'You have received a message on Origin.'
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
          fs.readFileSync(`${templateDir}/buyer-OfferRuling.html`).toString()
        ),
        text: _.template(
          fs.readFileSync(`${templateDir}/buyer-OfferRuling.txt`).toString()
        )
      }
    }
  }
}

module.exports = { messageTemplates }
