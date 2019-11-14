import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'

import query from 'queries/SkinnyIdentity'
import Reviews from 'components/Reviews'
import DocumentTitle from 'components/DocumentTitle'
import QueryError from 'components/QueryError'
import LoadingSpinner from 'components/LoadingSpinner'
import UserProfileCard from 'components/UserProfileCard'
import TabView from 'components/TabView'
import MobileModal from 'components/MobileModal'

import withIsMobile from 'hoc/withIsMobile'
import { withRouter } from 'react-router-dom'

import UserListings from './_UserListings'

const goBack = history => {
  if (history.length <= 1) {
    history.push('/')
  } else {
    history.goBack()
  }
}

const User = ({ match, isMobile, history }) => {
  const { id, content } = match.params
  const variables = { id: match.params.id }

  const { data, loading, error } = useQuery(query, { variables })

  if (error) {
    return <QueryError error={error} query={query} vars={variables} />
  }
  if (loading) return <LoadingSpinner />

  const profile = get(data, 'identity') || {}
  const showingReviews = content === 'reviews'

  const reviewsComp = (
    <Reviews
      id={id}
      hideWhenZero={!showingReviews && !isMobile}
      hideHeader={isMobile}
    />
  )

  if (showingReviews) {
    return (
      <div className="container user-public-profile">
        <DocumentTitle
          pageTitle={fbt(
            fbt.param('user', profile.fullName) + ' Reviews',
            'User.reviews.title'
          )}
        />
        <div className="row reviews-only">
          <div className="col-md-8">
            {isMobile ? (
              <MobileModal
                className="reviews-modal"
                title={fbt('Reviews', 'Reviews')}
                onBack={() => goBack(history)}
              >
                {reviewsComp}
              </MobileModal>
            ) : (
              reviewsComp
            )}
          </div>
        </div>
      </div>
    )
  }

  const listingsComp = (
    <UserListings
      user={id}
      hideHeader={isMobile}
      horizontal={isMobile ? false : true}
      hideIfEmpty={true}
    />
  )
  return (
    <div className="container user-public-profile">
      <DocumentTitle
        pageTitle={profile.fullName || fbt('Unnamed User', 'User.title')}
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
            showMessageLink={true}
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
    > .reviews-only.row > .col-md-8
      padding: 1rem
      > .reviews
        margin-top: 1.5rem
        border: 0

  @media (max-width: 767.98px)
    .user-public-profile
      padding-top: 0
      > .row > .col-md-8
        padding: 0
    .reviews-modal
      padding: 1rem
`)
