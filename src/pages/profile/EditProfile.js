import React, { Component } from 'react'
import AvatarEditor from 'react-avatar-editor'
import readAndCompressImage from 'browser-image-resizer';

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

  blobToDataURL(blob) {
    return new Promise((resolve) => {
      let a = new FileReader()
      a.onload = function(e) {resolve(e.target.result)}
      a.readAsDataURL(blob)
    })
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
              let canvas = this.imageEditor.getImage().toDataURL()
              let res = await fetch(canvas)
              let blob = await res.blob()
              let resized = await readAndCompressImage(blob, {
                quality: 1,
                maxWidth: 500,
                maxHeight: 500
              })
              data.pic = await this.blobToDataURL(resized)
            }
            this.props.handleSubmit({ data })
          }}
        >
          <div className="container">
            <div className="row">
              <div className="col-12 col-sm-6">
                <div className="image-container">
                  <div className="image-pair">
                    <div className="avatar-container">
                      <AvatarEditor
                        ref={r => (this.imageEditor = r)}
                        image={this.state.pic || "images/avatar-unnamed.svg"}
                        width={140}
                        height={140}
                        border={20}
                        borderRadius={20}
                        position={{ x: 0, y: 0 }}
                      />
                    </div>
                    <label className="edit-profile">
                      <img
                        src="images/camera-icon-circle.svg"
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
              <div className="col-12 col-sm-6">
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
                <div className="explanation text-center">
                  This information will be published on the blockchain and will be visible to everyone.
                </div>
                <div className="button-container d-flex justify-content-center">
                  <button type="submit" className="btn btn-clear">
                    Continue
                  </button>
                </div>
                <div className="link-container text-center">
                  <a
                    href="#"
                    data-modal="profile"
                    onClick={handleToggle}
                  >
                    Cancel
                  </a>
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
