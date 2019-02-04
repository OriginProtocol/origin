import React, { Component, Fragment } from 'react'
import { Query } from 'react-apollo'
import QueryError from 'components/QueryError'

class GrowthWelcome extends Component {
  state = {
  }

  render() {
    return (
      <div className="container growth-welcome d-flex">
        <div className="col-6 d-flex flex-column">
          <img className="logo" src="/images/origin-logo-footer.svg"/>
          <div className="title-text">
            Your friend Aure has invited you to earn <b>FREE Origin Tokens</b>
          </div>
          <div className="sub-title-text">
            Create an account on Origin today and start completing tasks for the chance to will up to 2000 OGN currently valued at 2000 USD. Don’t miss this amazing opportunity
          </div>
          <button
            className="btn btn-primary btn-rounded"
            type="submit"
            children="Sign up for Origin"
          />
        </div>
        <div className="col-6"> bsd</div>
      </div>
    )
  }
}

export default GrowthWelcome

require('react-styl')(`
  .growth-welcome
    margin-top: 100px;
    .logo
      width: 118px;
    .title-text
      margin-top: 40px;
      margin-bottom: 16px;
      font-family: Poppins;
      font-size: 50px;
      font-weight: 200;
      line-height: 1.3;
    .btn
      margin-top: 40px;
      width: 336px;
      height: 60px;
      font-size: 24px;
      font-weight: 900;
`)
