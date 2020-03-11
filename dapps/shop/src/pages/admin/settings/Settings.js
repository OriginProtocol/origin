import React from 'react'
import { NavLink, Switch, Route } from 'react-router-dom'

import ServerSettings from './Server'
import ClientSettings from './Client'

const AdminSettings = () => {
  return (
    <>
      <h3>Settings</h3>
      <ul className="nav nav-tabs mt-3">
        <li className="nav-item">
          <NavLink className="nav-link" to="/admin/settings" exact>
            Server
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink className="nav-link" to={`/admin/settings/client`}>
            Client
          </NavLink>
        </li>
      </ul>
      <Switch>
        <Route path="/admin/settings/client">
          <ClientSettings />
        </Route>
        <Route>
          <ServerSettings />
        </Route>
      </Switch>
    </>
  )
}

export default AdminSettings
