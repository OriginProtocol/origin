import React, { Component, Fragment } from 'react'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'

import Modal from 'components/modal'
import Avatar from 'components/avatar'

class EditProfile extends Component {
  constructor(props) {
    super(props)
    this.nameRef = React.createRef()

    const { pic, firstName, lastName, description } = props.data

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

    this.handleDescriptionChange = this.handleDescriptionChange.bind(this)
  }

  componentDidUpdate(prevProps) {
    const { data } = this.props
    const { pic } = data
    if (pic && pic !== prevProps.data.pic) {
      this.setState({ pic })
    }

    if (!prevProps.open && this.props.open) {
      setTimeout(() => {
        this.nameRef.current.focus()
      }, 500)
    }
  }

  handleDescriptionChange(e) {
    const { mobileDescriptionMaxLength, mobileLayout } = this.props
    const description = e.currentTarget.value
    this.setState({ description: mobileLayout
      ? description.substring(0, Math.min(description.length, mobileDescriptionMaxLength))
      : description
    })
  }

  render() {
    const { handleToggle, open, mobileLayout } = this.props

    return (
      <Fragment>
        <Modal
          isOpen={open && !mobileLayout}
          className="profile"
          handleToggle={handleToggle}
          tabIndex="-1"
        >
          {this.renderFormBody(false)}
        </Modal>
        <div className={`mobileProfile ${open && mobileLayout ? 'd-md-none' : 'd-none'}`}>
          {this.renderFormBody(true)}
        </div>
      </Fragment>
    )
  }

  renderFormBody(mobileLayout) {
    const { intl, handleToggle, mobileDescriptionMaxLength } = this.props
    const { firstName, lastName, description, pic } = this.state
    const descriptionCounter = mobileDescriptionMaxLength - description.length

    return (
      <Fragment>
        { mobileLayout ?
          (
            <div className="d-flex title align-items-center">
              <a
                href="#"
                data-modal="profile"
                onClick={handleToggle}
                className="col-2 d-flex align-items-center"
              >
                <img src="images/caret-white.svg" />
              </a>
              <h2 className="col-8">
                <FormattedMessage
                  id={'EditProfile.editProfileHeading'}
                  defaultMessage={'Edit Profile'}
                />
              </h2>
              <div className="col-2"></div>
            </div>
          ) :
          (
            <h2>
              <FormattedMessage
                id={'EditProfile.editProfileHeading'}
                defaultMessage={'Edit Profile'}
              />
            </h2>
          )
        }
        <form
          onSubmit={async e => {
            e.preventDefault()
            const data = {
              firstName: firstName,
              lastName: lastName,
              description: description
            }
            this.props.handleSubmit({ data })
          }}
        >
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-5 col-sm-6">
                <div className="image-container">
                  <div className="image-pair">
                    <Avatar
                      image={pic}
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
                        accept="image/jpeg,image/gif,image/png"
                        ref={r => (this.editPic = r)}
                        style={{ opacity: 0, position: 'absolute', zIndex: -1, width: '30px' }}
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
                  <label className="edit-profile-label" htmlFor="first-name">
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
                    value={firstName}
                    onChange={e =>
                      this.setState({ firstName: e.currentTarget.value })
                    }
                    placeholder={intl.formatMessage(
                      this.intlMessages.firstNamePlaceholder
                    )}
                  />
                </div>
                <div className="form-group">
                  <label className="edit-profile-label" htmlFor="last-name">
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
                    value={lastName}
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
                  <label className="edit-profile-label" htmlFor="description">
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
                    value={description}
                    onChange={this.handleDescriptionChange}
                    placeholder={intl.formatMessage(
                      this.intlMessages.descriptionPlaceholder
                    )}
                  />
                  {mobileLayout && <label className="character-counter">
                    {descriptionCounter}
                  </label>}
                </div>
              </div>
              <div className="col-12">
                {!mobileLayout && (<div className="explanation text-center">
                  <FormattedMessage
                    id={'EditProfile.publicDataNotice'}
                    defaultMessage={
                      'This information will be published on the blockchain and will be visible to everyone.'
                    }
                  />
                </div>)}
                {mobileLayout ?
                  (<div className="button-container d-flex justify-content-center">
                    <button type="submit" className="btn btn-primary btn-edit">
                      <FormattedMessage
                        id={'EditProfile.save'}
                        defaultMessage={'Save'}
                      />
                    </button>
                  </div>)
                  :
                  (<div className="button-container d-flex justify-content-center">
                    <button type="submit" className="btn btn-clear">
                      <FormattedMessage
                        id={'EditProfile.continue'}
                        defaultMessage={'Continue'}
                      />
                    </button>
                  </div>)
                }
                { !mobileLayout && (<div className="link-container text-center">
                  <a href="#" data-modal="profile" onClick={handleToggle}>
                    <FormattedMessage
                      id={'EditProfile.cancel'}
                      defaultMessage={'Cancel'}
                    />
                  </a>
                </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </Fragment>
    )
  }
}

export default injectIntl(EditProfile)
