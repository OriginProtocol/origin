import React, { Component, Fragment } from 'react'
import { fbt } from 'fbt-runtime'

import ActionGroup from 'components/growth/ActionGroup'

function ActionGroupList(props) {
  const { isMobile } = props

  return (
    <div className={`action-list-group d-flex flex-column ${isMobile ? 'mobile' : ''}`}>
      <ActionGroup
        type="verifications"
        hasBorder={true}
        {...props}
      />
      <ActionGroup
        type="purchases"
        hasBorder={true}
        {...props}
      />
      <ActionGroup
        type="invitations"
        {...props}
      />
    </div>
  )
}

export default ActionGroupList

// require('react-styl')(`
//   .action-list-group
// `)
