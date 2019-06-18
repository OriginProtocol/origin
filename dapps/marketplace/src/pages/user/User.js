import React from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'

import query from 'queries/Identity'
import Reviews from 'components/Reviews'
import DocumentTitle from 'components/DocumentTitle'
import QueryError from 'components/QueryError'
import LoadingSpinner from 'components/LoadingSpinner'
import UserProfileCard from 'components/UserProfileCard'
import TabView from 'components/TabView'

import withIsMobile from 'hoc/withIsMobile'

import UserListings from './_UserListings'

class User extends React.Component {
  componentDidMount() {
    document.body.classList.add('has-profile-page')
  }

  componentWillUnmount() {
    document.body.classList.remove('has-profile-page')
  }

  render() {
    const { match, ismobile } = this.props

    const id = match.params.id
    const vars = { id: match.params.id }
    const isMobile = ismobile === 'true'
  
    return (
      <div className="container user-public-profile">
        <Query query={query} variables={vars}>
          {({ data, loading, error }) => {
            if (error) {
              return <QueryError error={error} query={query} vars={vars} />
            }
            if (loading) return <LoadingSpinner />
  
            const profile = get(data, 'web3.account.identity') || {}
  
            const reviewsComp = <Reviews id={id} hideWhenZero hideHeader={isMobile} />
            const listingsComp = <UserListings user={id} />
            return (
              <>
                <DocumentTitle
                  pageTitle={
                    profile.fullName || fbt('Unnamed User', 'User.title')
                  }
                />
                <div className="row">
                  <div className="col-md-8">
                    <UserProfileCard
                      wallet={profile.id}
                      avatarUrl={profile.avatarUrl}
                      firstName={profile.firstName}
                      lastName={profile.lastName}
                      description={profile.description}
                      verifiedAttestations={profile.verifiedAttestations}
                    />
                    {isMobile ? (
                      <TabView
                        tabs={[
                          {
                            id: 'reviews',
                            title: fbt('Reviews', 'Reviews'),
                            component: reviewsComp
                          },
                          {
                            id: 'listings',
                            title: fbt('Listings', 'Listings'),
                            component: listingsComp
                          }
                        ]}
                      />
                    ) : (
                      <>
                        {listingsComp}
                        {reviewsComp}
                      </>
                    )}
                  </div>
                </div>
              </>
            )
          }}
        </Query>
      </div>
    )
  }
}

export default withIsMobile(User)

require('react-styl')(`
  .user-public-profile
    padding-top: 2rem
    > .row > .col-md-8
      margin: 0 auto

      > .user-listings, > .reviews
        padding: 1.5rem 0
        border-top: 1px solid #dde6ea
        margin-top: 0.5rem

  @media (max-width: 767.98px)
    .user-public-profile
      padding-top: 0
      > .row > .col-md-8
        padding: 0
`)
