import React from 'react';
import ReactDOM from 'react-dom';
import { Route, HashRouter } from 'react-router-dom'

import App from './pages/App';

ReactDOM.render(
  <HashRouter>
    <Route component={App} />
  </HashRouter>,
  document.getElementById('app')
)

require('react-styl').addStylesheet()
