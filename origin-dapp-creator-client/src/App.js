import React from 'react'
import { Switch, Route, NavLink } from 'react-router-dom'
import {
  Button,
  Classes,
  ControlGroup,
  Dialog,
  FormGroup,
  Icon,
  InputGroup,
  Intent,
  Navbar,
  Tooltip
} from '@blueprintjs/core'

import Create from './pages/Create'
import Help from './pages/Help'

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

class App extends React.Component {
  constructor (props) {
    super(props)
    this.isOpen = false
    this.state = {
      hostname: '',
      isOpen: false
    }
    this.handleClose = this.handleClose.bind(this)
    this.handleLoad = this.handleLoad.bind(this)
  }

  handleClose () {
    this.setState({ isOpen: false })
  }

  handleLoad () {
    this.setState({ isOpen: true })
  }

  render() {
    const input = field => ({
      value: this.state[field],
      onChange: e => this.setState({ [field]: e.currentTarget.value })
    })

    return (
      <>
        <Navbar className="bp3-dark">
          <Navbar.Group>
            <Navbar.Heading className="logo">
              <img src="public/images/origin-icon-white.svg" /> Creator
            </Navbar.Heading>
            <Link to="/" tooltip="Create a new configuration" icon="build" />
            <Tooltip content="Load an existing configuration" lazy={true}>
              <Button className="bp3-minimal" onClick={this.handleLoad}>
                <Icon icon="floppy-disk" />
              </Button>
            </Tooltip>
            <Link to="/docs" tooltip="Documentation" icon="help" />
          </Navbar.Group>
        </Navbar>

        <Switch>
          <Route path="/" component={Create} />
          <Route path="/docs" component={Help} />
        </Switch>

        <Dialog
          title="Load Existing Configuration"
          isOpen={this.state.isOpen}
          onClose={this.handleClose}
        >
          <div className={Classes.DIALOG_BODY}>
            <FormGroup label="Hostname">
              <ControlGroup fill={true}>
                <InputGroup {...input('hostname')} />
              </ControlGroup>
            </FormGroup>
          </div>

          <div className={Classes.DIALOG_FOOTER}>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
              <Button
                intent={Intent.PRIMARY}
              >
                Load
              </Button>
            </div>
          </div>
        </Dialog>
      </>
    )
  }
}

export default App

require('react-styl')(`
  body
    min-width: 1000px
  .logo
    opacity: 1
    font-size: 1.2rem
    font-weight: 300
    padding-right: 10px
    img
      vertical-align: -8px
      margin-right: 10px
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
