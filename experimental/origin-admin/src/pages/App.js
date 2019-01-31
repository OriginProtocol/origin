import React from 'react'
import { Switch, Route, Redirect, NavLink } from 'react-router-dom'
import { Navbar, Alignment, Icon, Tooltip } from '@blueprintjs/core'

import Price from 'components/Price'
import MetaMaskSwitcher from 'components/MetaMaskSwitcher'
import Accounts from './accounts/Accounts'
import Listings from './listings/Listings'
import Listing from './listings/Listing'
import Activity from './marketplace/Activity'
import Users from './users/Users'
import User from './users/User'
import RegisteredUsers from './identity/RegisteredUsers'
import Identity from './identity/Identity'
import Messaging from './messaging/Messaging'
import Contracts from './contracts/Contracts'
import Explorer from './GraphIQL'

import TransactionToasts from './_TransactionToasts'
import NodeInfo from './_NodeInfo'

require('normalize.css/normalize.css')
require('@blueprintjs/core/lib/css/blueprint.css')
require('@blueprintjs/table/lib/css/table.css')
require('@blueprintjs/icons/lib/css/blueprint-icons.css')
require('@blueprintjs/datetime/lib/css/blueprint-datetime.css')
require('graphiql/graphiql.css')

if (process.env.NODE_ENV === 'production') {
  require('../../public/css/app.css')
}

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
    <TransactionToasts />
    <Navbar>
      <Navbar.Group>
        <Navbar.Heading className="logo">
          <img src="images/origin-logo-dark.png" /> ADMIN
        </Navbar.Heading>
        <Link to="/marketplace" icon="shop" tooltip="Listings" />
        <Link to="/activity" icon="pulse" tooltip="Activity" />
        <Link to="/users" icon="people" tooltip="Users" />
        <Link to="/identities" icon="mugshot" tooltip="Identities" />
        <Link to="/messaging" icon="chat" tooltip="Messaging" />
        <Link to="/explorer" icon="console" tooltip="GraphQL Console" />
        <Link to="/accounts" icon="settings" tooltip="Settings" />
      </Navbar.Group>
      <Navbar.Group align={Alignment.RIGHT}>
        <MetaMaskSwitcher />
        <Price amount="1" label="1 ETH =" className="mr-3" />
        <NodeInfo />
      </Navbar.Group>
    </Navbar>
    <Switch>
      <Route path="/accounts" component={Accounts} />
      <Route path="/marketplace/listings/:listingID" component={Listing} />
      <Route path="/marketplace" component={Listings} />
      <Route path="/users/:userId" component={User} />
      <Route path="/users" component={Users} />
      <Route path="/identities/:identityId" component={Identity} />
      <Route path="/identities" component={RegisteredUsers} />
      <Route path="/activity" component={Activity} />
      <Route path="/contracts" component={Contracts} />
      <Route path="/explorer" component={Explorer} />
      <Route path="/messaging" component={Messaging} />
      <Redirect from="/" to="/marketplace" />
    </Switch>
  </>
)

window.isOriginAdmin = true
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
  .vm > td
    vertical-align: middle !important
  .ellip
    max-width: 200px
    white-space: nowrap
    overflow: hidden
    text-overflow: ellipsis
`)
