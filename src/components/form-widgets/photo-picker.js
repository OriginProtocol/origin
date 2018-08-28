import React, { Component } from 'react'

class PhotoPicker extends Component {
  constructor(props) {
    super(props)
    this.state = {
      pictures: []
    }

    this.onChange = this.onChange.bind(this)
  }

  async getDataUri(file) {
    const reader = new FileReader()

    return new Promise((resolve) => {
      reader.onloadend = () => {
        const { result } = reader
        const simicolonIdx = result.indexOf(';') + 1
        // react-jsonschema-form requires the name in the URI for an unknown reason
        const uriWithFileName = 
          `${result.substring(0, simicolonIdx)}name=${file.name};${result.substring(simicolonIdx, result.length)}`
        resolve(uriWithFileName)
      }
      reader.readAsDataURL(file)
    })
  }

  onChange() {
    return async (event) => {
      const filesObj = event.target.files
      const filesArr = []
      for (const key in filesObj) {
        if (filesObj.hasOwnProperty(key)) {
          filesArr.push(filesObj[key])
        }
      }

      const filesAsDataUriArray = filesArr.map(async (fileObj) =>
        this.getDataUri(fileObj)
      )

      Promise.all(filesAsDataUriArray).then((dataUriArray) => {
        this.setState({
          pictures: dataUriArray
        }, () => this.props.onChange(dataUriArray))
      })
    }
  }

  render() {
    return(
      <div className="photo-picker">
        <label className="photo-picker-container" htmlFor="photo-picker-input">
          <img className="camera-icon" src="images/camera-icon.svg" role="presentation" />
          <br/>
          <span>{this.props.schema.title}</span>
          <br/>
          {this.state.pictures.map((dataUri, idx) => 
            <img className="preview-thumbnail" src={ dataUri } key={ idx } />
          )}
        </label>
        <input
          id="photo-picker-input"
          type="file"
          accept="image/jpeg,image/gif,image/png"
          visibility="hidden"
          onChange={ this.onChange() }
          required={ this.props.required }
          multiple />
      </div>
    )
  }
}

export default PhotoPicker
