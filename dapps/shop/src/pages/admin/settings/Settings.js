import React from 'react'
import { NavLink, Switch, Route } from 'react-router-dom'

import ServerSettings from './Server'
import ClientSettings from './Client'
import Users from './Users'
import Console from './Console'

const AdminSettings = () => (
  <>
    <h3>Settings</h3>
    <ul className="nav nav-tabs mt-3">
      <li className="nav-item">
        <NavLink className="nav-link" to="/admin/settings" exact>
          Client
        </NavLink>
      </li>
      <li className="nav-item">
        <NavLink className="nav-link" to="/admin/settings/server" exact>
          Server
        </NavLink>
      </li>
      <li className="nav-item">
        <NavLink className="nav-link" to="/admin/settings/users">
          Users
        </NavLink>
      </li>
      <li className="nav-item">
        <NavLink className="nav-link" to="/admin/settings/console">
          Console
        </NavLink>
      </li>
    </ul>
    <Switch>
      <Route path="/admin/settings/users">
        <Users />
      </Route>
      <Route path="/admin/settings/server">
        <ServerSettings />
      </Route>
      <Route path="/admin/settings/console">
        <Console />
      </Route>
      <Route>
        <ClientSettings />
      </Route>
    </Switch>
  </>
)

export default AdminSettings
