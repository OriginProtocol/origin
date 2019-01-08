import React from 'react'

class ImagePicker extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      data: null,
      loading: false
    }

    this.handleFileChange = this.handleFileChange.bind(this)
    this.handleClearClick = this.handleClearClick.bind(this)
  }

  handleFileChange(event) {
    const { target } = event
    const { files } = target

    if (files && files[0]) {
      var reader = new FileReader();

      reader.onloadstart = () => this.setState({ loading: true })

      reader.onload = event => {
        this.setState({
          data: event.target.result,
          loading: false
        })
      }

      reader.readAsDataURL(files[0]);
    }
  }

  handleClearClick() {
    this.setState({ data: null })
  }

  render() {
    const { data, loading } = this.state

    return (
      <>
        <input
          className="form-control-file"
          type="file"
          accept="image/*"
          onChange={this.handleFileChange}
        />

        <div
          className="image-picker"
          onClick={this.handlePreviewClick}
        >
          <h2>{this.props.title}</h2>
          <p>Drag and drop your logo or click the button below to browse</p>
          <button className="btn btn-default">
            Upload
          </button>
        </div>
      </>
    )
  }
}

require('react-styl')(`
  input
    width: 1px
    height: 1px
    opacity: 0
    position: absolute
    overflow: hidden
    z-index: -1
`)

export default ImagePicker
