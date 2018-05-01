import React, { Component } from 'react'

class User extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className="profile-wrapper">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <p>This is a placeholder for user {this.props.userAddress}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default User
