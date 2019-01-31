import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { ApolloProvider } from 'react-apollo'
// import { persistCache } from 'apollo-cache-persist'
import { Route, HashRouter } from 'react-router-dom'
import Styl from 'react-styl'
import client from 'origin-graphql'

import App from './pages/App'
import Analytics from './components/Analytics'
import './css/app.css'
if (process.env.NODE_ENV === 'production') {
  try {
    require('../public/app.css')
  } catch (e) {
    console.log('No built CSS found')
  }
}

class AppWrapper extends Component {
  state = { ready: false, client: null }

  async componentDidMount() {
    try {
      // await persistCache({
      //   cache: client.cache,
      //   storage: window.sessionStorage
      // })
      this.setState({ ready: true, client })
    } catch (error) {
      console.error('Error restoring Apollo cache', error)
    }
  }

  render() {
    if (!this.state.ready) return null
    return (
      <ApolloProvider client={client}>
        <HashRouter>
          <Analytics>
            <Route component={App} />
          </Analytics>
        </HashRouter>
      </ApolloProvider>
    )
  }
}

ReactDOM.render(<AppWrapper />, document.getElementById('app'))

Styl.addStylesheet()
