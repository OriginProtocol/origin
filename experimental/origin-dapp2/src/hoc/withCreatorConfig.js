import React from 'react'
import { Query } from 'react-apollo'
import { withRouter } from 'react-router-dom'
import get from 'lodash/get'
import queryString from 'query-string'

import CreatorConfigQuery from 'queries/CreatorConfig'

import { isWhiteLabelHostname, applyConfiguration } from 'utils/marketplaceCreator'

function withCreatorConfig(WrappedComponent) {
  return class extends React.Component {
    constructor(props) {
      super(props)
    }

    async componentDidUpdate() {
      let configUrl
      const parsed = queryString.parse(this.props.location.search)
      if (parsed.config) {
        // Config URL was passed in the query string
        configUrl = parsed.config
      } else if (isWhiteLabelHostname()) {
        // Hostname is something custom, assume config is at config.<hostname>
        configUrl = `config.${window.location.hostname}`
      }

      if (configUrl) {
        // Retrieve the config
        await fetch(configUrl)
          .then(response => response.json())
          .then(responseJson => {
            this.setState({
              config: {
                isWhiteLabelled: true,
                ...responseJson.config
              }
            })
          })
          .catch(error => {
            console.log('Could not set custom configuration: ' + error)
          })
      }
    }

    render () {
      return (
        <Query query={CreatorConfigQuery}>
          {({ data, networkStatus }) => {
            const creatorConfig = get(data, 'creatorConfig', {})
            return (
              <WrappedComponent
                {...this.props}
                creatorConfig={creatorConfig}
              />
            )
          }}
        </Query>
      )
    }
  }
}

export default withCreatorConfig
