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
          <img src="images/camera-icon.svg" role="presentation" />
          {this.props.schema.title}
          {this.props.required &&
            <span className="required">*</span>
          }
        </label>
        <input
          id="photo-picker-input"
          type="file"
          accept="image/jpeg,image/gif,image/png"
          onChange={ this.onChange() }
          required={ this.props.required }
          multiple />
        {this.state.pictures.map((dataUri, idx) => 
          <img src={ dataUri } key={ idx } />
        )}
      </div>
    )
  }
}

export default PhotoPicker
