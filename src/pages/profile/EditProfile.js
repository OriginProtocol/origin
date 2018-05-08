import React, { Component } from 'react'
import AvatarEditor from 'react-avatar-editor'

import Modal from 'components/modal'

class EditProfile extends Component {
  constructor(props) {
    super(props)
    this.nameRef = React.createRef()

    const { pic, firstName, lastName, description } = this.props.data
    this.state = {
      pic,
      firstName,
      lastName,
      description
    }
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.open && this.props.open) {
      setTimeout(() => {
        this.nameRef.current.focus()
      }, 500)
    }
  }

  render() {
    const { open, handleToggle } = this.props

    return (
      <Modal isOpen={open} data-modal="profile" handleToggle={handleToggle}>
        <h2>Edit Profile</h2>
        <form
          onSubmit={async e => {
            e.preventDefault()
            var data = {
              firstName: this.state.firstName,
              lastName: this.state.lastName,
              description: this.state.description
            }
            if (this.state.picChanged) {
              await new Promise((resolve) => {
                const canvas = this.imageEditor.getImage().toDataURL();
                fetch(canvas)
                .then(res => res.blob())
                .then(blob => {
                  data.pic = window.URL.createObjectURL(blob)
                  resolve()
                });
              })
            }
            this.props.handleSubmit({ data })
          }}
        >
          <div className="container">
            <div className="row">
              <div className="col-6">
                <div className="image-container">
                  <div className="image-pair">
                    <div className="avatar-container">
                      <AvatarEditor
                        ref={r => (this.imageEditor = r)}
                        image={this.state.pic || "/images/avatar-unnamed.svg"}
                        width={140}
                        height={140}
                        border={20}
                        borderRadius={20}
                        position={{ x: 0, y: 0 }}
                      />
                    </div>
                    <label className="edit-profile">
                      <img
                        src="/images/camera-icon-circle.svg"
                        alt="camera icon"
                      />
                      <input
                        type="file"
                        ref={r => (this.editPic = r)}
                        style={{ opacity: 0, position: 'absolute', zIndex: -1 }}
                        onChange={e => {
                          this.setState({
                            picChanged: true,
                            pic: e.currentTarget.files[0]
                          })
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div className="form-group">
                  <label htmlFor="first-name">First Name</label>
                  <input
                    type="text"
                    ref={this.nameRef}
                    name="firstName"
                    className="form-control"
                    value={this.state.firstName}
                    onChange={e =>
                      this.setState({ firstName: e.currentTarget.value })
                    }
                    placeholder="Your First Name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="last-name">Last Name</label>
                  <input
                    type="text"
                    id="last-name"
                    name="lastName"
                    className="form-control"
                    value={this.state.lastName}
                    onChange={e =>
                      this.setState({ lastName: e.currentTarget.value })
                    }
                    placeholder="Your Last Name"
                  />
                </div>
              </div>
              <div className="col-12">
                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    rows="4"
                    id="description"
                    name="description"
                    className="form-control"
                    value={this.state.description}
                    onChange={e =>
                      this.setState({ description: e.currentTarget.value })
                    }
                    placeholder="Tell us a little something about yourself"
                  />
                </div>
              </div>
              <div className="col-12">
                <div className="button-container">
                  <a
                    className="btn btn-clear"
                    data-modal="profile"
                    onClick={handleToggle}
                  >
                    Cancel
                  </a>
                  <button type="submit" className="btn btn-clear">
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Modal>
    )
  }
}

EditProfile.getDerivedStateFromProps = (nextProps, prevState) => {
  var newState = {}
  var { firstName, lastName, description } = prevState
  var curData = JSON.stringify({ firstName, lastName, description })
  if (JSON.stringify(nextProps.data) !== curData) {
    newState = { ...newState, ...nextProps.data }
  }
  return newState
}

export default EditProfile
