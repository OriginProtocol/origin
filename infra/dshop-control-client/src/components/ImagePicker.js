'use strict'

import axios from 'axios'
import UploadIcon from 'react-svg-loader!../assets/upload-icon.svg'

import React, { useState } from 'react'

const acceptedFileTypes = [
  'image/jpeg',
  'image/pjpeg',
  'image/png',
  'image/vnd.microsoft.icon',
  'image/x-icon',
  // Not valid but sometimes used for icons
  'image/ico',
  'image/icon'
]

const ImagePicker = props => {
  const [imageUrl, setImageUrl] = useState(props.imageUrl)
  const [loading, setLoading] = useState(false)
  const [uploadError, setUploadError] = useState(null)

  const handleFileChange = async event => {
    const { target } = event
    const { files } = target

    setUploadError(null)
    setLoading(false)

    if (files && files[0]) {
      const file = files[0]

      if (acceptedFileTypes.indexOf(file.type) >= 0) {
        const body = new FormData()
        body.append('file', file)

        await axios
          .post(`${process.env.IPFS_API_URL}/api/v0/add`, body, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
          .then(response => {
            const imageUrl = `${process.env.IPFS_GATEWAY_URL}/ipfs/${response.data.Hash}`
            setImageUrl(imageUrl)
            if (props.onUpload) {
              props.onUpload(props.name, imageUrl)
            }
          })
          .catch(error => {
            if (error.response) {
              if (error.response.status === 413) {
                setUploadError(
                  'Image is too large, please choose something below 2mb.'
                )
              } else if (error.response.status === 415) {
                setUploadError(
                  'That file type is not supported, please use JPEG or PNG'
                )
              }
            } else {
              console.error(error)
              setUploadError('An error occurred uploading your image')
            }
            setLoading(false)
          })
      } else {
        setUploadError(
          'That file type is not supported, please use JPEG or PNG'
        )
        setLoading(false)
      }
    }
  }

  /*
  const handleClearClick = () => {
    setImageUrl(null)
  }
  */

  const renderPreview = () => {
    return (
      <div className="preview">
        <div className="upload-wrapper">
          <img src={imageUrl} />
        </div>
        <label htmlFor="image-picker" className="btn btn-outline-primary">
          Change
        </label>
      </div>
    )
  }

  return (
    <div className="image-picker-wrapper">
      <input
        id="image-picker"
        className="form-control-file"
        type="file"
        accept={acceptedFileTypes}
        onChange={handleFileChange}
      />

      {imageUrl ? (
        renderPreview()
      ) : (
        <div className="image-picker">
          <div className="upload-wrapper">
            <UploadIcon />
            {props.title && <p className="title">{props.title}</p>}
            <p>
              Recommended Size: <br />
              {props.recommendedSize}
            </p>
          </div>
          <label
            htmlFor="image-picker"
            className="btn btn-outline-primary"
            disabled={loading}
          >
            Upload
          </label>
        </div>
      )}

      {uploadError && <div className="invalid-feedback">{uploadError}</div>}
    </div>
  )
}

require('react-styl')(`
  .image-picker-wrapper .invalid-feedback
    display: block

  .upload-wrapper
    position: relative
    background-color: var(--pale-grey-four)

  .image-picker, .preview
    text-align: center;

  .image-picker
    padding: 2rem
    border: 1px dashed var(--light)
    border-radius: var(--default-radius)
    background-color: var(--pale-grey-four)

  .image-picker img
    margin-bottom: 0.25rem

  .preview
    label
      margin-top: 2rem
    img
      max-width: 100%
      margin: auto

  .title
    color: var(--dark)
    font-size: 1.125rem

  .form-control-file
    width: 1px
    height: 1px
    opacity: 0
    position: absolute
    overflow: hidden
    z-index: -1
`)

export default ImagePicker
