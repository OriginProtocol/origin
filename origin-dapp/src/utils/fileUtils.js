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
 * @description Creates a modified imageDataUri when given options
 * @param {file} imageFileObj - The image file object from the file input element
 * @param {object} options - https://github.com/blueimp/JavaScript-Load-Image#options
 * @param {function} callback- called with a imageDataUri
 */

export const modifyImage = (imageFileObj, options, callback) => {
  const updatedOptions = {
    ...options,
    crossOrigin: 'anonymous'
  }

  loadImage(
    imageFileObj,
    (canvas, meta) => {
      canvas.toBlob(async (blob) => {
        blob.name = imageFileObj.name
        const dataUri = await getDataUri(blob)

        callback(dataUri)
      }, 'image/jpeg')
    },
    updatedOptions
  )
}

/*
 * generateCroppedImage
 * @description Creates a cropped image file when given crop dimensions
 * @param {file} imageFileObj - The image file object from the file input element
 * @param {object} pixelCrop - The object containing the dimensions of the crop area
 * @param {number} pixelCrop.height - The height of the crop area
 * @param {number} pixelCrop.width - The width of the crop area
 * @param {number} pixelCrop.x - The x coordinate of the top-left corner of the crop area
 * @param {number} pixelCrop.y - The y coordinate of the top-left corner of the crop area
 * @param {function} callback- called with the result of modifyImage (an imageDataUri)
 */

export const generateCroppedImage = async (imageFileObj, pixelCrop, callback) => {
  let cropWidth = pixelCrop.width
  let cropHeight = pixelCrop.width / 1.33333 // 4:3 aspect ratio

  if (cropHeight > pixelCrop.height) {
    cropHeight = pixelCrop.height
    cropWidth = cropHeight * 1.33333
  }

  const { x, y, width, height } = pixelCrop

  const options = {
    maxHeight: MAX_IMAGE_HEIGHT,
    maxWidth: MAX_IMAGE_WIDTH,
    minWidth: cropWidth,
    minHeight: cropHeight,
    sourceWidth: width,
    sourceHeight: height,
    left: x,
    top: y,
    orientation: true,
    crop: true
  }

  modifyImage(imageFileObj, options, (dataUri) => callback(dataUri))
}
