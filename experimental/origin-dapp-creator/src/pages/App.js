import React from 'react'
import { Navbar, Alignment, Icon, Tooltip } from '@blueprintjs/core'

require('normalize.css/normalize.css')
require('@blueprintjs/core/lib/css/blueprint.css')

const App = () => (
  <>
  <Navbar>
    <Navbar.Group>
      <Navbar.Heading className="logo">
        <img src="public/images/origin-logo-dark.png" /> DApp Creator
      </Navbar.Heading>
    </Navbar.Group>
  </Navbar>
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
`)
