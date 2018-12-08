import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'

import Modal from 'components/Modal'

const MakeOfferMutation = gql`
  mutation MakeOffer($listingID: String!, $value: String!, $from: String!) {
    makeOffer(listingID: $listingID, value: $value, from: $from) {
      id
    }
  }
`

class Buy extends Component {
  state = {}
  render() {
    const { listing, from } = this.props
    const variables = { listingID: listing.id, value: '0.5', from }

    return (
      <Mutation
        mutation={MakeOfferMutation}
        onComplete={() => console.log('complete')}
      >
        {(makeOffer, { error }) => {
          return (
            <>
              <button
                className="btn btn-primary"
                onClick={() => {
                  this.setState({ modal: true })
                  makeOffer({ variables })
                }}
                children="Buy Now"
              />

              {!this.state.modal ? null : (
                <Modal
                  shouldClose={this.state.shouldClose}
                  onClose={() => this.setState({ modal: false })}
                >
                  <div className="buy-modal">
                    {error ? (
                      <>
                        <div>{JSON.stringify(error)}</div>
                        <a
                          href="#"
                          onClick={e => {
                            e.preventDefault()
                            this.setState({ shouldClose: true })
                          }}
                        >
                          OK
                        </a>
                      </>
                    ) : (
                      <>
                        <div className="spinner light" />
                        <div>
                          <b>Processing your request.</b>
                        </div>

                        <div>Please stand by...</div>
                      </>
                    )}
                  </div>
                </Modal>
              )}
            </>
          )
        }}
      </Mutation>
    )
  }
}

export default Buy

require('react-styl')(`
  .buy-modal .spinner
    margin-bottom: 2rem
`)
