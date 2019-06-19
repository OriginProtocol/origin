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
import { withRouter } from 'react-router-dom'

import UserListings from './_UserListings'

const User = ({ match, isMobile, history }) => {
  const id = match.params.id
  const vars = { id: match.params.id }

  return (
    <div className="container user-public-profile">
      <a
        className="back-icon"
        onClick={() => {
          // TBD: is history.length safe to use?
          if (history.length <= 1) {
            history.push('/')
          } else {
            history.goBack()
          }
        }}
      />
      <Query query={query} variables={vars}>
        {({ data, loading, error }) => {
          if (error) {
            return <QueryError error={error} query={query} vars={vars} />
          }
          if (loading) return <LoadingSpinner />

          const profile = get(data, 'web3.account.identity') || {}

          const reviewsComp = (
            <Reviews id={id} hideWhenZero hideHeader={isMobile} />
          )
          const listingsComp = <UserListings user={id} hideHeader={isMobile} />
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

export default withRouter(withIsMobile(User))

require('react-styl')(`
  .user-public-profile
    position: relative
    padding-top: 2rem
    > .row > .col-md-8
      margin: 0 auto
      > .user-listings, > .reviews
        padding: 1.5rem 0
        border-top: 1px solid #dde6ea
        margin-top: 0.5rem
    .back-icon
      display: none
      height: 2rem
      width: 2rem
      top: 1rem
      left: 0.5rem
      position: absolute
      background-image: url('images/caret-grey.svg')
      background-size: 1.5rem
      background-position: center
      transform: rotateZ(270deg)
      background-repeat: no-repeat
      z-index: 10

  @media (max-width: 767.98px)
    .user-public-profile
      padding-top: 0
      > .row > .col-md-8
        padding: 0
      .back-icon
        display: inline-block
`)
