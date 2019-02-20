import React from 'react'
import { Query } from 'react-apollo'
import { withRouter } from 'react-router-dom'
import queryString from 'query-string'
import get from 'lodash/get'

import { isWhiteLabelHostname } from 'utils/marketplaceCreator'
import CreatorConfigQuery from 'queries/CreatorConfig'

let creatorConfigUrl

function withCreatorConfig(WrappedComponent) {
  const WithTokens = props => {
    const parsed = queryString.parse(props.location.search)
    if (parsed.config) {
      // Config URL was passed in the query string
      creatorConfigUrl = parsed.config
    } else if (creatorConfigUrl) {
      // Config URL already set...
    } else if (isWhiteLabelHostname()) {
      // Hostname is something custom, assume config is at config.<hostname>
      creatorConfigUrl = `config.${window.location.hostname}`
    }

    return (
      <Query query={CreatorConfigQuery} variables={{ creatorConfigUrl }}>
        {({ data, networkStatus }) => (
          <WrappedComponent
            {...props}
            creatorConfigLoading={networkStatus === 1}
            creatorConfig={get(data, 'creatorConfig', {})}
          />
        )}
      </Query>
    )
  }
  return withRouter(WithTokens)
}

export default withCreatorConfig
