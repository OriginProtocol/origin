import React from 'react'

import JoinModal from './JoinModal'

const AffiliatesLanding = ({ state, setState, account, dispatch }) => {
  return (
    <div className="affiliate-landing">
      {!state.modal ? null : (
        <JoinModal {...{ state, setState, account, dispatch }} />
      )}
      <div className="affiliates-header" />
      <h2>
        Invite anyone to check out the Stay At Home Shop and we’ll give you 1
        OGN for every $2 they spend!
      </h2>
      <div className="description">
        All you need is a <b>web3 wallet</b> and an{' '}
        <b>Origin Rewards account</b> to join the Affiliate program and activate
        your Affiliate toolbar.
      </div>
      <button
        onClick={() => setState({ modal: true })}
        className="btn btn-dark btn-lg"
        children="Join Origin Affiliates"
      />
      <a
        className="btn btn-link"
        href="https://www.shoporigin.com/#/welcome"
        target="_blank"
        rel="noopener noreferrer"
      >
        I don&apos;t have an Origin Rewards account
      </a>
      <a
        className="btn btn-link mt-2"
        href="https://ethereum.org/wallets/"
        target="_blank"
        rel="noopener noreferrer"
      >
        I don&apos;t have a web3 wallet
      </a>
      <div className="description-sm">
        The more you share, the more you earn. Become an Affiliate now!
      </div>
    </div>
  )
}

export default AffiliatesLanding

require('react-styl')(`
  .affiliates-header
    background-image: url(images/affiliate-header2.svg)
    background-repeat: no-repeat
    height: 16rem
    width: 100%
    background-position: center bottom
  .affiliate-landing
    display: flex
    flex-direction: column
    align-items: center
    text-align: center
    .btn-link
      color: #007dff
      text-decoration: underline
      padding: 0
    h2
      font-size: 1.25rem
      font-weight: 700
      margin: 2rem 10% 1rem 10%
    .description
      margin: 0 10% 2rem 10%
      font-size: 1.125rem
    .description-sm
      margin: 2rem 10% 1rem 10%
      color: #333
    .btn-dark
      padding-left: 4rem
      padding-right: 4rem
      margin-bottom: 2rem
  @media (max-width: 767.98px)
    .affiliates-header
      height: 14rem
    .affiliate-landing
      .btn-dark
        padding-left: 2rem
        padding-right: 2rem

`)
