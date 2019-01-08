import loadImage from 'blueimp-load-image'

const MAX_IMAGE_WIDTH = 1000
const MAX_IMAGE_HEIGHT = 1000

export const getDataUri = async file => {
  const reader = new FileReader()

  return new Promise(resolve => {
    reader.onloadend = () => {
      const { result } = reader
      const simicolonIdx = result.indexOf(';') + 1
      // react-jsonschema-form requires the name in the URI for an unknown reason
      const uriWithFileName = `${result.substring(0, simicolonIdx)}name=${
        file.name
      };${result.substring(simicolonIdx, result.length)}`
      resolve(uriWithFileName)
    }

    reader.readAsDataURL(file)
  })
}

/*
 * getCroppedDimensions
 * @description uses the canvas dimensions to generate the auto-crop dimensions
 * @param {file} canvas - The image canvas to be modified
 */

export const getCroppedDimensions = (canvas) => {
  const imageWidth = canvas.width
  const imageHeight = canvas.height

  let cropWidth
  let cropHeight
  let left
  let top

  if (imageWidth > imageHeight) {
    // Landscape orientation
    cropHeight = imageHeight
    cropWidth = imageHeight * 1.3333
    left = (imageWidth / 2) - (cropWidth / 2)
    top = 0
  } else {
    // Portrait orientation
    cropWidth = imageWidth
    cropHeight = imageWidth / 1.3333
    top = (imageHeight / 2) - (cropHeight / 2)
    left = 0
  }

  return {
    left,
    top,
    sourceWidth: cropWidth,
    sourceHeight: cropHeight
  }
}

/*
 * scaleAndCropImage
 * @description Creates a scaled & cropped imageDataUri when given options
 * @param {file} canvas - The image canvas to be modified
 * @param {object} config - https://github.com/blueimp/JavaScript-Load-Image#options
 * @param {function} callback- called with an imageDataUri
 */

export const scaleAndCropImage = (props) => {
  const { config, callback, imageFileObj, options } = props

  loadImage(imageFileObj, (canvas) => {
    let newConfig = config

    if (config.crop) {
      newConfig = { ...config, ...getCroppedDimensions(canvas) }
    }

    const scaledImage = loadImage.scale(canvas, newConfig)
    scaledImage.toBlob(async (blob) => {
      if (imageFileObj.name) {
        blob.name = imageFileObj.name
      } else {
        blob.name = Math.random().toString(36).substring(4)
      }
      const dataUri = await getDataUri(blob)

      callback(dataUri)
    }, 'image/jpeg')
  }, options)

}

/*
 * generateCroppedImage
 * @description Creates a cropped image file when given crop dimensions
 * @param {file} imageFileObj - The image file object from the file input element
 * @param {file} pixelCrop - The object containing the dimensions of the crop area,
 * as well as the aspect ratio. If undefined, the image will not be cropped
 * @param {number} aspectRatio - the ratio of the width to the height of an image (i.e. 4/3)
 * @param {bool} centerCrop - whether to auto-crop the image at its center
 * @param {number} height - The height of the crop area
 * @param {number} width - The width of the crop area
 * @param {number} x - The x coordinate of the top-left corner of the crop area
 * @param {number} y - The y coordinate of the top-left corner of the crop area
 * @param {function} callback- called with the result of modifyImage (an imageDataUri)
 */

export const generateCroppedImage = async (imageFileObj, pixelCrop, callback) => {
  const {
    x = 0,
    y = 0,
    width,
    height,
    aspectRatio,
    centerCrop = false
  } = pixelCrop || {}

  const defaultConfig = {
    left: x,
    top: y,
    aspectRatio
  }
  const options = {
    orientation: true,
    crossOrigin: 'anonymous',
    maxHeight: MAX_IMAGE_HEIGHT,
    maxWidth: MAX_IMAGE_WIDTH
  }

  if (centerCrop) {
    // This is used by listing-create component to auto-crop images
    // Load the image, find the center, and auto-crop it
    const dataUri = await getDataUri(imageFileObj)
    const image = new Image()

    image.onload = function centerCropImage() {
      const config = {
        ...defaultConfig,
        crop: true
      }

      scaleAndCropImage({ options, config, callback, imageFileObj })
    }
    image.src = dataUri

  } else {
    // This is used by Profile (avatar selection) and messaging (resizing large images)
    const config = {
      ...defaultConfig,
      sourceWidth: width,
      sourceHeight: height,
    }

    scaleAndCropImage({ options, imageFileObj, config, callback })
  }
}

export const getDataURIsFromImgURLs = async (picUrls) => {
  const imagePromises = picUrls.map(url => {
    return new Promise(async resolve => {
      const image = new Image()
      image.crossOrigin = 'anonymous'

      image.onload = function() {
        const canvas = document.createElement('canvas')
        canvas.width = this.naturalWidth
        canvas.height = this.naturalHeight
        canvas.getContext('2d').drawImage(this, 0, 0)
        canvas.toBlob(file => {
          resolve(getDataUri(file))
        }, 'image/jpeg')
      }

      image.src = url
    })
  })

  return Promise.all(imagePromises)
}

export const picURIsOnly = (pictures = []) => {
  return pictures.map(pic => typeof pic === 'object' ? pic.croppedImageUri : pic)
}
