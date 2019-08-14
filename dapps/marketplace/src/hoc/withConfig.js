import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import get from 'lodash/get'

import ConfigQuery from 'queries/Config'

function withConfig(WrappedComponent, prop = 'config') {
  const WithConfig = ({ ...props }) => {
    const { data, networkStatus } = useQuery(ConfigQuery)
    props[prop] = get(data, 'configObj') || {}
    props[`${prop}Loading`] = networkStatus === 1
    return <WrappedComponent {...props} />
  }
  return WithConfig
}

export default withConfig
