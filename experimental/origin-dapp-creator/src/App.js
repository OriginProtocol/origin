import React from 'react'
import { Provider } from 'react-redux'
import {
  BrowserRouter as Router,
  Route
} from 'react-router-dom'

// Blueprint CSS imports
import 'normalize.css/normalize.css'
import '@blueprintjs/icons/lib/css/blueprint-icons.css'
import '@blueprintjs/core/lib/css/blueprint.css'

import Index from './components/Index'

const App = () => {
  return (
    <Router>
      <div>
        <Route path="/create" component={Index} />
        <Route path="/" component={Index} />
      </div>
    </Router>
  )
}

export default App
