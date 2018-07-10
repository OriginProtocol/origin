import moment from 'moment'
import React, { Component } from 'react'
import { FormattedDate, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'

import Avatar from './avatar'
import DialogueListItem from './dialogue-list-item'
import PurchaseProgress from './purchase-progress'

import data from '../data'
import origin from '../services/origin'

// may not be necessary when using real data
const groupByArray = (xs, key) => {
  return xs.reduce((rv, x) => {
    let v = key instanceof Function ? key(x) : x[key]
    let el = rv.find((r) => r && r.key === v)

    if (el) {
      el.values.push(x)
    } else {
      rv.push({ key: v, values: [x] })
    }

    return rv
  }, [])
}

class Messages extends Component {
  constructor(props) {
    super(props)

    const dialogues = groupByArray(data.messages, 'dialogueId')

    this.state = {
      counterparty: {},
      dialogues,
      listing: null,
      purchase: null,
      selectedDialogueId: '',
    }
  }

  componentDidMount() {
    this.detectSelectedDialogue()
  }

  componentDidUpdate(prevProps, prevState) {
    const { dialogueId } = this.props.match.params
    const { selectedDialogueId } = this.state

    // on route change
    if (dialogueId && dialogueId !== prevProps.match.params.dialogueId) {
      this.detectSelectedDialogue()
    }

    // on dialogue selection
    if (selectedDialogueId && selectedDialogueId !== prevState.selectedDialogueId) {
      this.identifyCounterparty()
      this.loadListing()
    }
  }

  detectSelectedDialogue() {
    const selectedDialogueId = this.props.match.params.dialogueId || (this.state.dialogues[0] || {}).key

    this.setState({ selectedDialogueId })
  }

  async findPurchase() {
    const { web3Account } = this.props
    const { counterparty, listing } = this.state
    const { address, sellerAddress } = listing
    const len = await origin.listings.purchasesLength(address)
    const purchaseAddresses = await Promise.all([...Array(len).keys()].map(async i => {
      return await origin.listings.purchaseAddressByIndex(address, i)
    }))
    const purchases = await Promise.all(purchaseAddresses.map(async addr => {
      return await origin.purchases.get(addr)
    }))
    const involvingCounterparty = purchases.filter(p => p.buyerAddress === counterparty.address || p.buyerAddress === web3Account)
    const mostRecent = involvingCounterparty.sort((a, b) => a.created > b.created ? -1 : 1)[0]
    
    this.setState({ purchase: mostRecent })
  }

  identifyCounterparty() {
    const web3Account = this.props
    const { dialogues, selectedDialogueId } = this.state
    const dialogue = dialogues.find(d => d.key === selectedDialogueId)
    const { fromAddress, fromName, toAddress, toName } = dialogue.values[0]
    const counterpartyRole = fromAddress === web3Account ? 'recipient' : 'sender'

    this.setState({
      counterparty: counterpartyRole === 'recipient' ? {
        address: toAddress,
        name: toName,
      } : {
        address: fromAddress,
        name: fromName,
      },
    })
  }

  async loadListing() {
    const { dialogues, selectedDialogueId } = this.state
    // find the most recent listing context or set empty value
    const { listingId } = dialogues.find(d => d.key === selectedDialogueId)
                          .values
                          .sort((a, b) => a.createdAt < b.createdAt ? -1 : 1)
                          .find(m => m.listingId) || {}

    const listing = listingId ? (await origin.listings.get(listingId)) : null

    this.setState({ listing })

    if (listing) {
      this.findPurchase()
    }
  }

  handleDialogueSelect(selectedDialogueId) {
    this.setState({ selectedDialogueId })
  }

  render() {
    const { web3Account } = this.props
    const { counterparty, dialogues, listing, purchase, selectedDialogueId } = this.state
    const { messages } = data
    const { address, name, pictures } = listing || {}
    const photo = pictures && pictures.length > 0 && (new URL(pictures[0])).protocol === "data:" && pictures[0]
    const perspective = purchase ? (purchase.buyerAddress === web3Account ? 'buyer' : 'seller') : null
    const soldAt = purchase ? purchase.created * 1000 /* convert seconds since epoch to ms */ : null

    return (
      <div className="d-flex messages-wrapper">
        <div className="container">
          <div className="row no-gutters">
            <div className="dialogues-list-col col-12 col-sm-4 col-lg-3">
              {dialogues.map(d => {
                return (
                  <DialogueListItem key={d.key} dialogue={d} active={selectedDialogueId === d.key} handleDialogueSelect={() => this.handleDialogueSelect(d.key)} />
                )
              })}
            </div>
            <div className="dialogue-col col-12 col-sm-8 col-lg-9">
              {listing &&
                <div className="listing-summary d-flex">
                  <div className="aspect-ratio">
                    <div className={`${photo ? '' : 'placeholder '}image-container d-flex justify-content-center`}>
                      <img src={photo || 'images/default-image.svg'} role="presentation" />
                    </div>
                  </div>
                  <div className="content-container d-flex flex-column">
                    {purchase &&
                      <div className="brdcrmb">
                        {perspective === 'buyer' &&
                          <FormattedMessage
                            id={ 'purchase-summary.purchasedFrom' }
                            defaultMessage={ 'Purchased from {sellerLink}' }
                            values={{ sellerLink: <Link to={`/users/${counterparty.address}`}>{counterparty.name}</Link> }}
                          />
                        }
                        {perspective === 'seller' &&
                          <FormattedMessage
                            id={ 'purchase-summary.soldTo' }
                            defaultMessage={ 'Sold to {buyerLink}' }
                            values={{ buyerLink: <Link to={`/users/${counterparty.address}`}>{counterparty.name}</Link> }}
                          />
                        }
                      </div>
                    }
                    <h1>{name}</h1>
                    {purchase &&
                      <div className="state">
                        {perspective === 'buyer' &&
                          <FormattedMessage
                            id={ 'purchase-summary.purchasedFromOn' }
                            defaultMessage={ 'Purchased from {sellerName} on {date}' }
                            values={{ sellerName: counterparty.name, date: <FormattedDate value={soldAt} /> }}
                          />
                        }
                        {perspective === 'seller' &&
                          <FormattedMessage
                            id={ 'purchase-summary.soldToOn' }
                            defaultMessage={ 'Sold to {buyerName} on {date}' }
                            values={{ buyerName: counterparty.name, date: <FormattedDate value={soldAt} /> }}
                          />
                        }
                      </div>
                    }
                    {purchase &&
                      <PurchaseProgress
                        purchase={purchase}
                        perspective={perspective}
                        subdued={true}
                      />
                    }
                  </div>
                </div>
              }
              <div className="dialogue">
                {messages.filter(m => m.dialogueId === selectedDialogueId)
                  .sort((a, b) => a.createdAt < b.createdAt ? -1 : 1)
                  .map(m => {
                    return (
                      <div key={`${m.createdAt.toISOString()}:${m.fromAddress}:${m.toAddress}`} className="d-flex message">
                        <Avatar placeholderStyle="blue" />
                        <div className="content-container">
                          <div className="sender">
                            {m.fromName || m.fromAddress}
                          </div>
                          <div className="message">
                            {m.content}
                          </div>
                        </div>
                        <div className="timestamp text-right">
                          {moment(m.createdAt).format('MMM Do h:mm a')}
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    web3Account: state.app.web3.account,
  }
}

export default withRouter(connect(mapStateToProps)(Messages))
