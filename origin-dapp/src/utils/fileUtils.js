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
 * modifyImage
 * @description Creates a scaled & modified imageDataUri when given options
 * @param {file} imageFileObj - The image file object from the file input element
 * @param {object} options - https://github.com/blueimp/JavaScript-Load-Image#options
 * @param {function} callback- called with an imageDataUri
 */

export const modifyImage = (imageFileObj, options, callback) => {
  const loadImageOptions = {
    orientation: true,
    crossOrigin: 'anonymous',
    // maxHeight: MAX_IMAGE_HEIGHT,
    // maxWidth: MAX_IMAGE_WIDTH
  }

  loadImage(imageFileObj, (canvas) => {
    const scaledImage = loadImage.scale(canvas, options)

    scaledImage.toBlob(async (blob) => {
      blob.name = imageFileObj.name
      const dataUri = await getDataUri(blob)

      callback(dataUri)
    }, 'image/jpeg')
  }, loadImageOptions)
}

/*
 * generateCroppedImage
 * @description Creates a cropped image file when given crop dimensions
 * @param {file} imageFileObj - The image file object from the file input element
 * @param {file} options - The object containing the dimensions of the crop area,
 * as well as the aspect ratio. If undefined, the image will not be cropped
 * @param {number} aspectRatio - the ratio of the width to the height of an image (i.e. 4/3)
 * @param {bool} centerCrop - whether to auto-crop the image at its center
 * @param {number} height - The height of the crop area
 * @param {number} width - The width of the crop area
 * @param {number} x - The x coordinate of the top-left corner of the crop area
 * @param {number} y - The y coordinate of the top-left corner of the crop area
 * @param {function} callback- called with the result of modifyImage (an imageDataUri)
 */

export const generateCroppedImage = async (imageFileObj, options, callback) => {
  const {
    x = 0,
    y = 0,
    width,
    height,
    aspectRatio,
    centerCrop = false
  } = options || {}

  const defaultConfig = {
    left: x,
    top: y,
    orientation: true
  }
  let config = defaultConfig


  function centerCropImage() {
    //the natural width and height does not know about orientation
    const imageWidth = this.naturalWidth
    const imageHeight = this.naturalHeight

    let cropWidth
    let cropHeight

    if (imageWidth > imageHeight) {
      // Landscape orientation
      cropHeight = imageHeight
      cropWidth = imageHeight * 1.3333
      config = {
        ...defaultConfig,
        left: (imageWidth / 2) - (cropWidth / 2),
        top: 0,
        sourceWidth: cropWidth,
        sourceHeight: cropHeight,
        crop: true,
        aspectRatio
      }
    } else {
      // Portrait orientation
      cropWidth = imageWidth
      cropHeight = imageWidth / 1.3333
      config = {
        ...defaultConfig,
        left: 0,
        top: (imageHeight / 2) - (cropHeight / 2),
        sourceWidth: cropWidth,
        sourceHeight: cropHeight,
        crop: true,
        aspectRatio
      }
    }

    modifyImage(imageFileObj, config, callback)
  }

  if (centerCrop) {
    // This is used by listing-create component to auto-crop images
    // Load the image, find the center, and auto-crop it
    const dataUri = await getDataUri(imageFileObj)
    const image = new Image()

    image.onload = centerCropImage
    image.src = dataUri

  } else {
    // This is used by Profile (avatar selection) and messaging (resizing large images)
    config = {
      ...defaultConfig,
      sourceWidth: width,
      sourceHeight: height,
      aspectRatio
    }

    modifyImage(imageFileObj, config, callback)
  }
}
