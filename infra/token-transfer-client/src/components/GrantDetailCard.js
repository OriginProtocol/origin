import React, { useContext } from 'react'

import { DataContext } from '@/providers/data'
import BorderedCard from '@/components/BorderedCard'
import GrantDetail from '@/components/GrantDetail'

const GrantDetailCard = ({ user }) => {
  const data = useContext(DataContext)

  return (
    <BorderedCard>
      {data.grants.length > 0 ? (
        <GrantDetail grants={data.grants} user={user} />
      ) : (
        <div className="empty">You don&apos;t have any token grants</div>
      )}
    </BorderedCard>
  )
}

export default GrantDetailCard
