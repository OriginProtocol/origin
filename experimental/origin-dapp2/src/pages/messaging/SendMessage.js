import React, { Component } from 'react'
import { Mutation } from 'react-apollo'

import mutation from 'mutations/SendMessage'
import withConfig from 'hoc/withConfig'

const acceptedFileTypes = ['image/jpeg', 'image/pjpeg', 'image/png']

async function postFile(ipfsRPC, file) {
  const body = new FormData()
  body.append('file', file)
  const rawRes = await fetch(`${ipfsRPC}/api/v0/add`, { method: 'POST', body })
  const res = await rawRes.json()
  return res.Hash
}

function fileSize(number) {
  if (number < 1024) {
    return number + 'bytes'
  } else if (number >= 1024 && number < 100000) {
    return (number / 1024).toFixed(1) + 'KB'
  } else if (number >= 100000 && number < 1048576) {
    return (number / 1024).toFixed() + 'KB'
  } else if (number >= 1048576) {
    return (number / 1048576).toFixed(1) + 'MB'
  }
}

async function getImage({ ipfsRPC, ipfsGateway }, file) {
  const hash = await postFile(ipfsRPC, file, file.type)
  return {
    contentType: file.type,
    size: fileSize(file.size),
    name: file.name,
    url: `ipfs://${hash}`,
    urlExpanded: `${ipfsGateway}/ipfs/${hash}`,
    src: `${ipfsGateway}/ipfs/${hash}`,
    hash
  }
}

class SendMessage extends Component {
  constructor(props) {
    super(props)

    this.fileInput = React.createRef()
    this.handleClick = this.handleClick.bind(this)
    this.state = { message: '', image: '' }
  }

  componentDidMount() {
    if (this.input) {
      this.input.focus()
    }
  }

  componentDidUpdate(prevProps) {
    if (this.input && this.props.to !== prevProps.to) {
      this.input.focus()
    }
  }

  handleClick() {
    this.fileInput.current.click()
  }

  render() {
    const { to, config } = this.props

    return (
      <Mutation mutation={mutation}>
        {sendMessage => (
          <>
            <div style={{ height: '300px' }}>{this.renderPreview()}</div>
            <form
              className="send-message d-flex"
              onSubmit={e => {
                e.preventDefault()
                const content = this.state.message || this.state.image.src
                if (content) {
                  sendMessage({ variables: { to, content } })
                  this.setState({ message: '' })
                }
              }}
            >
              <input
                type="text"
                className="form-control"
                placeholder="Type something..."
                ref={input => (this.input = input)}
                value={this.state.message}
                onChange={e => this.setState({ message: e.target.value })}
              />
              <img
                src="images/add-photo-icon.svg"
                className="add-photo"
                role="presentation"
                onClick={this.handleClick}
              />
              <input
                type="file"
                accept="image/jpeg,image/gif,image/png"
                ref={this.fileInput}
                className="d-none"
                onChange={async e => {
                  const newImage = await getImage(
                    config,
                    e.currentTarget.files[0]
                  )
                  this.setState({ image: newImage })
                }}
              />
              <button
                className="btn btn-primary btn-rounded"
                type="submit"
                children="Send"
              />
            </form>
          </>
        )}
      </Mutation>
    )
  }
  renderPreview() {
    if (!this.state.image) return null
    const { image } = this.state
    return (
      <div key={image.hash} className="preview-row">
        <div className="img" style={{ backgroundImage: `url(${image.src})` }} />
        <div className="info">
          {image.size}
          <a
            href="#"
            onClick={e => {
              e.preventDefault()
              this.setState({ image: '' })
            }}
            children="×"
          />
        </div>
      </div>
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

  .preview-row
    position: relative
    .info
      position: absolute
      top: 0
      right: 0
      background: rgba(255, 255, 255, 0.75)
      line-height: normal
      border-radius: 0 0 0 2px
      > a
        padding: 0 0.375rem
        font-weight: bold
        color: var(--dusk)
      &:hover
        a
          color: #000
        background: rgba(255, 255, 255, 0.85)
    .img
      background-position: center
      width: 100%
      padding-top: 66%
      background-size: contain
      background-repeat: no-repeat
`)
