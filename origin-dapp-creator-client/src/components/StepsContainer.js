'use strict'

import { withRouter } from 'react-router-dom'
import React from 'react'

import Steps from 'components/Steps'

class StepsContainer extends React.Component {
  render() {
    return <Steps {...this.props} />
  }
}

export default withRouter(props => <StepsContainer {...props} />)
