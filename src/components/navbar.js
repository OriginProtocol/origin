import React, { Component } from 'react'
import { Link } from 'react-router-dom'

const notifications = [
  {
    _id: '1foo2',
    transactionType: 'purchased',
    address: '0x12Be343B94f860124dC4fEe278FDCBD38C102D88',
    name: 'Matt L',
    product: 'Super Lambo',
  },
  {
    _id: '3bar4',
    transactionType: 'confirmed-receipt',
    address: '0x34Be343B94f860124dC4fEe278FDCBD38C102D88',
    name: 'Josh F',
    product: 'Wholesale Component',
  },
  {
    _id: '5baz6',
    transactionType: 'completed',
    address: '0x56Be343B94f860124dC4fEe278FDCBD38C102D88',
    name: 'Micah A',
    product: 'Blue Suede Shoes',
  },
  {
    _id: '7qux8',
    transactionType: 'confirmed-withdrawal',
    address: '0x78Be343B94f860124dC4fEe278FDCBD38C102D88',
  },
]

class HumanReadableNotification extends Component {
  render() {
    const { className, notification } = this.props
    const { address, name, product, transactionType } = notification
    const link = <Link to={`/users/${address}`}>{name || 'Anonymous User'}</Link>
    let predicate = ''

    if (transactionType === 'completed') {
      return (
        <p className={className || ''}>Transaction with {link} complete for <strong>{product}</strong>.</p>
      )
    }

    switch(transactionType) {
      case 'purchased':
        predicate = 'purchased your listing'
        break
      case 'confirmed-receipt':
        predicate = 'confirmed receipt of'
        break
      case 'confirmed-withdrawal':
        predicate = 'confirmed and withdrawn some amount of something?'
        break
      default:
        predicate = `${transactionType.replace('-', ' ')} ${product}`
    }

    return (
      <p className={className || ''}>{link} has {predicate}{product ? (<strong> {product}</strong>) : ''}</p>
    )
  }
}

class NavBar extends Component {
  constructor(props) {
    super(props)

    this.handleChange = this.handleChange.bind(this)
    this.state = { searchQuery: '' }
  }

  handleChange(e) {
    this.setState({ searchQuery: e.target.value })
  }

  render() {
    return (
      <nav className="navbar navbar-expand-lg navbar-dark">
        <div className="container">
          <button className="navbar-toggler mr-3" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <img src="/images/menu-icon-light.svg" alt="Menu" />
          </button>
          <Link to="/" className="navbar-brand mr-auto mr-lg-3">
            <div className="logo-container">
              <img src="/images/origin-logo.png"
                srcSet="/images/origin-logo@2x.png 2x, /images/origin-logo@3x.png 3x"
                className="origin-logo" alt="Origin Protocol" />
            </div>
          </Link>
          <div className="collapse navbar-collapse order-2 order-lg-1" id="navbarSupportedContent">
            <form className="form-inline my-2 my-lg-0">
              <input className="form-control mr-sm-2" type="search" placeholder="Search Listings" aria-label="Search" onChange={this.handleChange} value={this.state.searchQuery} />
            </form>
            <div className="navbar-nav justify-content-end">
              <a className="nav-item nav-link" onClick={() => alert('To Do')}>My Purchases</a>
              <a className="nav-item nav-link" onClick={() => alert('To Do')}>My Listings</a>
            </div>
          </div>
          <div className="static navbar-nav order-1 order-lg-2">
            <div className="nav-item notifications dropdown">
              <a className="nav-link active dropdown-toggle" id="notificationsDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <div className="unread-badge"></div>
                <img src="/images/alerts-icon.svg" className="notifications" alt="Notifications" />
                <img src="/images/alerts-icon-selected.svg" className="notifications selected" alt="Notifications" />
              </a>
              <svg height="18" width="18" className="triangle">
                <polygon points="18,0 18,18 0,18" />
              </svg>
              <div className="dropdown-menu dropdown-menu-right" aria-labelledby="notificationsDropdown">
                <header className="d-flex">
                  <div className="count"><p>4</p></div>
                  <h3>Notifications</h3>
                </header>
                <div className="notifications-list">
                  <ul className="list-group">
                    {notifications.map(n => (
                      <li key={n._id} className="list-group-item d-flex notification">
                        <div>
                          <div className="avatar-container">
                            <img src={`/images/${n.name ? 'avatar' : 'partners-graphic'}.svg`} alt="avatar" />
                          </div>
                        </div>
                        <div>
                          <HumanReadableNotification notification={n} className="content" />
                          <p className="address">{n.address}</p>
                        </div>
                        <div className="link-container ml-auto">
                          <Link to={`/notifications/${n._id}`} className="btn">&gt;</Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <footer>
                  <Link to="/notifications">View All</Link>
                </footer>
              </div>
            </div>
            <Link to="/create" className="nav-item nav-link"><img src="/images/add-listing-icon.svg" alt="Add Listing" className="add-listing" /></Link>
            <div className="nav-item profile dropdown">
              <a className="nav-link active dropdown-toggle" id="profileDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <img src="/images/identicon.png"
                  srcSet="/images/identicon@2x.png 2x, /images/identicon@3x.png 3x"
                  className="identicon" alt="Identicon" />
              </a>
              <svg height="18" width="18" className="triangle">
                <polygon points="18,0 18,18 0,18" />
              </svg>
              <div className="dropdown-menu dropdown-menu-right" aria-labelledby="profileDropdown">
                <div className="wallet">
                  <div className="image-container">
                    <img src="/images/identicon.png"
                      srcSet="/images/identicon@2x.png 2x, /images/identicon@3x.png 3x"
                      alt="wallet icon" />
                  </div>
                  <p>ETH Address:</p>
                  <p><strong>0x32Be343B94f860124dC4fEe278FDCBD38C102D88</strong></p>
                  <hr />
                  <div className="d-flex">
                    <div className="avatar-container">
                      <img src="/images/avatar.svg" alt="avatar" />
                    </div>
                    <div className="identification">
                      <p>Aure Gimon</p>
                      <img src="/images/twitter-icon-verified.svg" alt="Twitter verified icon" />
                    </div>
                  </div>
                  <hr />
                  <div className="detail">
                    <p>Account Balance:</p>
                    <p>0 ETH</p>
                  </div>
                  <div className="detail">
                    <p>Transaction History:</p>
                    <p><a href="#">ETH</a> | <a href="#">Tokens</a></p>
                  </div>
                  <div>
                    <p><a href="#">View My Listings &gt;</a></p>
                  </div>
                </div>
                <Link to="/profile" className="dropdown-item">View My Profile</Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    )
  }
}

export default NavBar
