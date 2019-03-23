import React, { Component } from 'react'
import TextareaAutosize from 'react-autosize-textarea'
import { Mutation } from 'react-apollo'
import trim from 'lodash/trim'

import mutation from 'mutations/SendMessage'
import withConfig from 'hoc/withConfig'

import { postFile } from 'utils/fileUtils'

const acceptedFileTypes = ['image/jpeg', 'image/pjpeg', 'image/png']

async function getImages(config, files) {
  const { ipfsGateway, ipfsRPC } = config

  const newImages = []
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const hash = await postFile(ipfsRPC, file)
    if (acceptedFileTypes.indexOf(file.type) >= 0) {
      newImages.push({
        contentType: file.type,
        url: `${ipfsGateway}/ipfs/${hash}`
      })
    }
  }
  return newImages
}

class SendMessage extends Component {
  constructor(props) {
    super(props)

    this.fileInput = React.createRef()
    this.handleClick = this.handleClick.bind(this)
    this.state = { message: '', images: '' }
  }

  // TODO: Focusing an offscreen element causes page to jump
  // componentDidMount() {
  //   if (this.input) {
  //     this.input.focus()
  //   }
  // }

  // componentDidUpdate(prevProps) {
  //   if (this.input && this.props.to !== prevProps.to) {
  //     this.input.focus()
  //   }
  // }

  handleClick() {
    this.fileInput.current.click()
  }

  async sendContent(sendMessage, to) {
    const { message, images } = this.state

    if (message.length) {
      sendMessage({ variables: { to, content: message } })
    } else {
      sendMessage({ variables: { to, media: images } })
    }

    this.setState({ message: '', images: [] })
  }

  render() {
    const { to, config } = this.props
    const { images, message } = this.state

    return (
      <Mutation mutation={mutation}>
        {sendMessage => (
          <form
            className="send-message d-flex"
            onSubmit={e => {
              e.preventDefault()
              if (trim(message) || images) {
                this.sendContent(sendMessage, to)
              }
            }}
          >
            {images.length ? (
              <div className="images-preview">
                {images.map(image => (
                  <div key={image.url} className="images-container">
                    <img className="img" src={image.url} />
                    <a
                      className="image-overlay-btn"
                      aria-label="Close"
                      onClick={() => {
                        this.setState({
                          images: images.filter(img => img !== image)
                        })
                      }}
                    >
                      <span aria-hidden="true">&times;</span>
                    </a>
                  </div>
                ))}
              </div>
            ) : null}
            {images.length ? null : (
              <TextareaAutosize
                className="form-control"
                placeholder="Type something..."
                ref={input => (this.input = input)}
                value={this.state.message}
                onChange={e => this.setState({ message: e.target.value })}
              />
            )}
            <img
              src="images/add-photo-icon.svg"
              className="add-photo"
              role="presentation"
              onClick={this.handleClick}
            />
            <input
              type="file"
              multiple={true}
              accept="image/jpeg,image/gif,image/png"
              ref={this.fileInput}
              className="d-none"
              onChange={async e => {
                const newImages = await getImages(config, e.currentTarget.files)
                this.setState(state => ({
                  images: [...state.images, ...newImages]
                }))
              }}
            />
            <button
              className="btn btn-sm btn-primary btn-rounded"
              type="submit"
              children="Send"
            />
          </form>
        )}
      </Mutation>
    )
  }
}

export default withConfig(SendMessage)

require('react-styl')(`
  .send-message
    border-top: 1px solid var(--pale-grey)
    padding-top: 1rem
    margin-top: 1rem
    .form-control
      margin-right: 1rem
      border: 0
      outline: none
    button
      margin: auto 0
      width: auto
    img.add-photo
      padding: 0 10px
    .images-preview
      flex: 1
      padding: 10px 0
      .images-container
        display: inline-block
        height: 100%
        position: relative
        max-height: 245px
        .img
          width: 185px
        .image-overlay-btn
          position: absolute
          top: 0
          right: 0
          cursor: pointer
          padding: 0.75rem
          line-height: 0.5
          background-color: white
          font-weight: bold
          border-bottom: 1px solid var(--light)
          opacity: 0.5
      .img
        background-position: center
        width: 100%
        background-size: contain
        background-repeat: no-repeat
`)
