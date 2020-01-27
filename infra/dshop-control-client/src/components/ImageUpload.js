import React from 'react'

import Gallery from 'components/Gallery'

const ImageUpload = ({ images, setImages }) => {
  const handleImageChange = e => {
    e.preventDefault()

    const reader = new FileReader()
    reader.onloadend = () => {
      setImages([...images, reader.result])
    }
    reader.readAsDataURL(e.target.files[0])
  }

  return (
    <>
      <div>
        <label className="btn btn-sm btn-secondary">
          Upload Image <input type="file" onChange={handleImageChange} hidden />
        </label>
      </div>
      {images.length > 0 && (
        <div className="p-3" style={{ maxWidth: '400px' }}>
          <Gallery pics={images} active={0} />
        </div>
      )}
    </>
  )
}

export default ImageUpload
