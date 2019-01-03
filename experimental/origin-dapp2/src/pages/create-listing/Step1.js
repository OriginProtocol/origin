import React, { Component } from 'react'

import Steps from 'components/Steps'
import Link from 'components/Link'

const Categories = [
  'For Sale',
  'E-commerce',
  'Housing',
  'Transportation',
  'Tickets',
  'Services',
  'Announcements'
]

class Step1 extends Component {
  state = {}
  render() {
    return (
      <div className="create-listing-step-1">
        <h2>Hi there! Let’s get started creating your listing</h2>
        <div className="wrap">
          <div className="step">Step 1</div>
          <div className="step-description">
            What type of listing do you want to create?
          </div>
          <Steps steps={3} step={1} />
          <ul className="list-unstyled">
            {Categories.map((cat, idx) => (
              <li
                key={idx}
                className={this.state.active === idx ? 'active' : ''}
                onClick={() => this.setState({ active: idx })}
              >
                {cat}
              </li>
            ))}
          </ul>
          <div className="actions">
            <Link className="btn btn-primary" to="/create/step-2">
              Continue
            </Link>
          </div>
        </div>
      </div>
    )
  }
}

export default Step1

require('react-styl')(`
  .create-listing-step-1
    max-width: 570px
    > .wrap
      max-width: 460px
    h2
      font-family: Poppins;
      font-size: 40px;
      font-weight: 200;
    ul li
      border: 1px solid var(--light)
      font-size: 18px
      font-weight: normal
      color: var(--dusk)
      margin-bottom: 0.75rem
      border-radius: 5px;
      padding: 0.75rem 1rem;
      cursor: pointer
      &:hover
        background-color: var(--pale-grey-eight)
      &.active
        color: var(--dark)
        border-color: #000
    .actions
      margin-top: 2rem
      display: flex;
      justify-content: flex-end;
      .btn
        min-width: 10rem
        border-radius: 2rem
        padding: 0.625rem
        font-size: 18px

`)
