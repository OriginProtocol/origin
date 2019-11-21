import React from 'react'

import BorderedCard from '@/components/BorderedCard'
import GrantDetail from '@/components/GrantDetail'

const GrantDetailCard = props => {
  return (
    <BorderedCard shadowed={true}>
      {props.grants.length > 0 ? (
        <GrantDetail grants={props.grants} user={props.user} />
      ) : (
        <div className="empty">You don&apos;t have any token grants</div>
      )}
    </BorderedCard>
  )
}

export default GrantDetailCard
