import React, { Component, Fragment } from 'react'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'

import Modal from 'components/modal'
import Avatar from 'components/avatar'

class EditProfile extends Component {
  constructor(props) {
    super(props)
    this.nameRef = React.createRef()

    const { pic, firstName, lastName, description, } = this.props.data
    this.state = {
      pic,
      firstName,
      lastName,
      description
    }

    this.intlMessages = defineMessages({
      descriptionPlaceholder: {
        id: 'EditProfile.descriptionPlaceholder',
        defaultMessage: 'Tell us a little something about yourself'
      },
      firstNamePlaceholder: {
        id: 'EditProfile.firstNamePlaceholder',
        defaultMessage: 'Your First Name'
      },
      lastNamePlaceholder: {
        id: 'EditProfile.lastNamePlaceholder',
        defaultMessage: 'Your Last Name'
      }
    })
  }

  componentDidUpdate(prevProps) {
    const { data } = this.props
    const { pic } = data
    if (pic && pic !== prevProps.data.pic) {
      this.setState({
        pic
      })
    }

    if (!prevProps.open && this.props.open) {
      setTimeout(() => {
        this.nameRef.current.focus()
      }, 500)
    }
  }

  blobToDataURL(blob) {
    return new Promise(resolve => {
      const a = new FileReader()
      a.onload = function(e) {
        resolve(e.target.result)
      }
      a.readAsDataURL(blob)
    })
  }

  render() {
    const { handleToggle, open, mobileLayout } = this.props

    return (
      <Fragment>
        <Modal
          isOpen={open && !mobileLayout}
          data-modal="profile"
          handleToggle={handleToggle}
          tabIndex="-1"
        >
          {this.renderFormBody(false)}
        </Modal>
        <div className={`mobileProfile ${open && mobileLayout ? "d-md-none" : "d-none"}`}>
          {this.renderFormBody(true)}
        </div>
      </Fragment>
    )
  }

  renderFormBody(mobileLayout) {
    const { intl, handleToggle } = this.props

    return (
      <Fragment>
        <h2>
          <FormattedMessage
            id={'EditProfile.editProfileHeading'}
            defaultMessage={'Edit Profile'}
          />
        </h2>
        <form
          onSubmit={async e => {
            e.preventDefault()
            const data = {
              firstName: this.state.firstName,
              lastName: this.state.lastName,
              description: this.state.description
            }
            this.props.handleSubmit({ data })
          }}
        >
          <div className="container">
            <div className="row">
              <div className="col-12 col-sm-6">
                <div className="image-container">
                  <div className="image-pair">
                    <Avatar
                      image={this.state.pic}
                      className="primary"
                      placeholderStyle="unnamed"
                    />
                    <label className="edit-profile">
                      <img
                        src="images/camera-icon-circle.svg"
                        alt="camera icon"
                      />
                      <input
                        id="edit-profile-image"
                        type="file"
                        ref={r => (this.editPic = r)}
                        style={{ opacity: 0, position: 'absolute', zIndex: -1 }}
                        onChange={e => {
                          this.props.handleCropImage(e.currentTarget.files[0])
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
              <div className="col-12 col-sm-6">
                <div className="form-group">
                  <label htmlFor="first-name">
                    <FormattedMessage
                      id={'EditProfile.firstName'}
                      defaultMessage={'First Name'}
                    />
                  </label>
                  <input
                    type="text"
                    ref={this.nameRef}
                    name="firstName"
                    className="form-control"
                    value={this.state.firstName}
                    onChange={e =>
                      this.setState({ firstName: e.currentTarget.value })
                    }
                    placeholder={intl.formatMessage(
                      this.intlMessages.firstNamePlaceholder
                    )}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="last-name">
                    <FormattedMessage
                      id={'EditProfile.lastName'}
                      defaultMessage={'Last Name'}
                    />
                  </label>
                  <input
                    type="text"
                    id="last-name"
                    name="lastName"
                    className="form-control"
                    value={this.state.lastName}
                    onChange={e =>
                      this.setState({ lastName: e.currentTarget.value })
                    }
                    placeholder={intl.formatMessage(
                      this.intlMessages.lastNamePlaceholder
                    )}
                  />
                </div>
              </div>
              <div className="col-12">
                <div className="form-group">
                  <label htmlFor="description">
                    <FormattedMessage
                      id={'EditProfile.description'}
                      defaultMessage={'Description'}
                    />
                  </label>
                  <textarea
                    rows="4"
                    id="description"
                    name="description"
                    className="form-control"
                    value={this.state.description}
                    onChange={e =>
                      this.setState({ description: e.currentTarget.value })
                    }
                    placeholder={intl.formatMessage(
                      this.intlMessages.descriptionPlaceholder
                    )}
                  />
                </div>
              </div>
              <div className="col-12">
                <div className="explanation text-center">
                  <FormattedMessage
                    id={'EditProfile.publicDataNotice'}
                    defaultMessage={
                      'This information will be published on the blockchain and will be visible to everyone.'
                    }
                  />
                </div>
                <div className="button-container d-flex justify-content-center">
                  <button type="submit" className="btn btn-clear">
                    <FormattedMessage
                      id={'EditProfile.continue'}
                      defaultMessage={'Continue'}
                    />
                  </button>
                </div>
                <div className="link-container text-center">
                  <a href="#" data-modal="profile" onClick={handleToggle}>
                    <FormattedMessage
                      id={'EditProfile.cancel'}
                      defaultMessage={'Cancel'}
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Fragment>
    )
  }
}

export default injectIntl(EditProfile)
