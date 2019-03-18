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

  renderWizzardBos(title, subtitle, rewardText, rewardAmount, buttonElements) {
  	return(<div className="profile-wizzard-box">
  	 {this.renderPublishChanges('what is up yo?')}
  	</div>)
  }

  render() {
  	return this.renderWizzardBos('what is up yo1', 'what is up yo1')
  }
}

export default ProfileWizzard

require('react-styl')(`
	.profile-wizzard-box
		border: solid 1px var(--light)
		border-radius: 5px;
`)