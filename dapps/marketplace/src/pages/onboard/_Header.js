import React from 'react'
import { fbt } from 'fbt-runtime'

const Header = () => (
  <div className="d-none d-md-block">
    <h2>
      <fbt desc="onboard.Header.gettingStarted">Getting started on Origin</fbt>
    </h2>
    <div className="explanation">
      <fbt desc="onboard.Header.description">
        In order to successfully transact with others on our DApp, you’ll need a
        few things before you get started.
        <a href="#">Why do I need to do this?</a>
      </fbt>
    </div>
  </div>
)

export default Header
