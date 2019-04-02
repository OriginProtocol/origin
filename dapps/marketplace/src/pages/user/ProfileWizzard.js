import React, { Component, Fragment } from 'react'
import { fbt } from 'fbt-runtime'

import DeployIdentity from 'pages/identity/mutations/DeployIdentity'

class ProfileWizzard extends Component {
	constructor(props) {
    super(props)
    // TODO: Might not need state at all
    this.state = {

    }
  }

  renderPublishChanges(buttonTextOption) {
  	const props = this.props.deployIdentityProps
  	if (buttonTextOption) {
  		props.children = buttonTextOption
  	}

  	return (<DeployIdentity {...props} />)
  }

  renderWizzardBox(title, subtitle, rewardText, rewardAmount, buttonElements) {
  	return(
      <div className="profile-wizzard-box d-flex justify-content-center pl-4 pr-4 pt-4">
        {this.renderPublishChanges('what is up yo?')}


      </div>
    )
  }

  render() {
  	return this.renderWizzardBox('what is up yo1', 'what is up yo1')
  }
}

export default ProfileWizzard

require('react-styl')(`
	.profile-wizzard-box
    background-color: white
    border-radius: 5px
    border: 1px solid var(--light)
    min-height: 190px
    position: relative
    padding-bottom: 35px
`)