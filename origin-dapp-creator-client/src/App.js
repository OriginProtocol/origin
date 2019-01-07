import React from 'react'
import { Switch, Route, NavLink } from 'react-router-dom'
import {
  Icon,
  Navbar,
  Tooltip
} from '@blueprintjs/core'

import Create from 'pages/Create'
import Help from 'pages/Help'

require('normalize.css/normalize.css')
require('@blueprintjs/core/lib/css/blueprint.css')

const Link = props => (
  <Tooltip content={props.tooltip} lazy={true}>
    <NavLink
        exact
        className="bp3-button bp3-minimal"
        activeClassName="bp3-active"
        to={props.to}>
      <Icon icon={props.icon} />
    </NavLink>
  </Tooltip>
)

class App extends React.Component {
  constructor (props) {
    super(props)
  }

  render() {
    return (
      <>
      <div className="logo">
        <img src="images/origin-logo-dark.png" className="logo" />
      </div>

      <div className="main">
        <div className="form">
          <Switch>
            <Route path="/" exact component={Create} />
            <Route path="/docs" component={Help} />
          </Switch>
        </div>
      </div>
      </>
    )
  }
}

export default App

require('react-styl')(`
  body
    min-width: 1000px
    background-color: #fafbfc;

  .logo
    margin-top: 40px;
    margin-bottom: 20px;
    text-align: center;

  .main
    background-color: white;
    border-radius: 5px;
    border: 1px solid #c2cbd3;
    margin: 0 auto;
    width: 810px;

  .form
    padding: 6rem

  h1
    font-family: Poppins;
    font-size: 24px;
    font-weight: 300;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.42;
    letter-spacing: normal;
    color: var(--dark);

  .text-center
    text-align: center

  .p-3
    padding: 1rem

  .mt-3
    margin-top: 1rem

  .mt-2
    margin-top: 0.5rem

  .mb-0
    margin-bottom: 0

  .mb-2
    margin-bottom: 0.5rem

  .mb-3
    margin-bottom: 1rem

  .ml-1
    margin-left: 0.25rem

  .ml-2
    margin-left: 0.5rem

  .ml-3
    margin-left: 1rem

  .mr-1
    margin-right: 0.25rem

  .mr-2
    margin-right: 0.5rem

  .mr-3
    margin-right: 1rem

  .mb-3
    margin-bottom: 1rem

  .input-width
    width: 300px

  .input-width-wide
    width: 500px
`)
