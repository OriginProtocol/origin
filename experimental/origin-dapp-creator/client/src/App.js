import React from 'react'
import { Switch, Route, Redirect, NavLink } from 'react-router-dom'
import { Navbar, Alignment, Icon, Tooltip } from '@blueprintjs/core'

import Create from './pages/Create'

require('normalize.css/normalize.css')
require('@blueprintjs/core/lib/css/blueprint.css')

const Link = props => (
  <Tooltip content={props.tooltip} lazy={true}>
    <NavLink
      className="bp3-button bp3-minimal"
      activeClassName="bp3-active"
      to={props.to}
    >
      <Icon icon={props.icon} />
    </NavLink>
  </Tooltip>
)

const App = () => (
  <>
  <Navbar>
    <Navbar.Group>
      <Icon icon="build" className="mr-3"></Icon>
      <Navbar.Heading className="logo">
        <img src="public/images/origin-logo-dark.png" /> DApp Creator
      </Navbar.Heading>
    </Navbar.Group>
  </Navbar>
  <Switch>
    <Route path="/" component={Create} />
  </Switch>
  </>
)

export default App

require('react-styl')(`
  body
    min-width: 1000px
  .logo
    opacity: 0.75
    font-size: 1.2rem
    font-weight: 300
    img
      width: 68px
      vertical-align: -1px
      margin-right: 2px
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
