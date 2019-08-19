import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import { withRouter } from 'react-router-dom'
import queryString from 'query-string'
import get from 'lodash/get'

import { isWhiteLabelHostname } from 'utils/marketplaceCreator'
import CreatorConfigQuery from 'queries/CreatorConfig'

let creatorConfigUrl

function withCreatorConfig(WrappedComponent) {
  const WithCreatorConfig = props => {
    const parsedPostHash = queryString.parse(props.location.search)
    const parsedPreHash = queryString.parse(location.search)
    if (parsedPostHash.config) {
      // Config URL was passed in the query string after #
      // e.g. http://localhost:3000/#/?config=<URL>
      creatorConfigUrl = parsedPostHash.config
    } else if (parsedPreHash.config) {
      // Config URL was passed in the query string before #
      // e.g. http://localhost:3000/?config=<URL>#/
      creatorConfigUrl = parsedPreHash.config
    } else if (creatorConfigUrl) {
      // Config URL already set...
    } else if (isWhiteLabelHostname()) {
      // Hostname is something custom, assume config is at config.<hostname>
      creatorConfigUrl = `config.${window.location.hostname}`
    }

    const { data, networkStatus } = useQuery(CreatorConfigQuery, {
      variables: {
        creatorConfigUrl
      }
    })

    return (
      <WrappedComponent
        {...props}
        creatorConfigLoading={networkStatus === 1}
        creatorConfig={get(data, 'creatorConfig', {})}
      />
    )
  }
  return withRouter(WithCreatorConfig)
}

export default withCreatorConfig
