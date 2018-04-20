import React, { Component } from 'react'
import { Link } from 'react-router-dom'

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

class Notification extends Component {
  render() {
    const { notification } = this.props
    const { address, name, role } = notification

    return (
      <li className="list-group-item d-flex notification">
        <div>
          <div className="avatar-container">
            <img src={`/images/avatar-${name ? 'blue' : 'anonymous'}.svg`} alt="avatar" />
            <div className={`${role} circle`}></div>
          </div>
        </div>
        <div className="content-container">
          <HumanReadableNotification notification={notification} className="content" />
          <p className="address">{address}</p>
        </div>
        <div className="link-container ml-auto">
          <a href="https://app.zeplin.io/project/59fa2311bac7acbc8d953da9/screen/5aa878781720abc6447f2cd3?did=5ab93f6fa022c2b641639214" className="btn" target="_blank">
            <img src="/images/carat.svg" alt="right carat" />
          </a>
        </div>
      </li>
    )
  }
}

export default Notification
