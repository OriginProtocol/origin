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
 * generateCroppedImage
 * @description Creates a cropped image file when given crop dimensions
 * @param {string} imageSrc - The source URL of the image
 * @param {file} imageFileObj - The image file object from the file input element
 * @param {object} pixelCrop - The object containing the dimensions of the crop area
 * @param {number} pixelCrop.height - The height of the crop area
 * @param {number} pixelCrop.width - The width of the crop area
 * @param {number} pixelCrop.x - The x coordinate of the top-left corner of the crop area
 * @param {number} pixelCrop.y - The y coordinate of the top-left corner of the crop area
 * @param {boolean} skipCropping - If set to true, the image is not cropped, only resized
 */
export const generateCroppedImage = async (imageFileObj, pixelCrop, skipCropping = false) => {
  const MAX_IMAGE_WIDTH = 1000
  const MAX_IMAGE_HEIGHT = 1000
  const imageSrc = await getDataUri(imageFileObj)
  let image
  let canvas

  function drawImageOnCanvas(imgEl) {
    let defaultConfig

    if (skipCropping) {
      defaultConfig = {
        x: 0,
        y: 0,
        width: imgEl.width,
        height: imgEl.height
      }
    } else {
      let cropWidth = imgEl.width
      let cropHeight = imgEl.width / 1.33333 // 4:3 aspect ratio

      if (cropHeight > imgEl.height) {
        cropHeight = imgEl.height
        cropWidth = cropHeight * 1.33333
      }

      defaultConfig = {
        x: (imgEl.width - cropWidth) / 2, // center crop horizontally
        y: (imgEl.height - cropHeight) / 2, // center crop area vertically
        width: cropWidth,
        height: cropHeight
      }
    }

    const { x, y, width, height } = pixelCrop || defaultConfig

    let resizedWidth = width
    let resizedHeight = height

    if (width > MAX_IMAGE_WIDTH) {
      resizedWidth = MAX_IMAGE_WIDTH
      const widthDiffRatio = resizedWidth / width
      resizedHeight = height * widthDiffRatio
    }

    if (resizedHeight > MAX_IMAGE_HEIGHT) {
      const heightDiffRatio = MAX_IMAGE_HEIGHT / resizedHeight
      resizedHeight = MAX_IMAGE_HEIGHT
      resizedWidth = resizedWidth * heightDiffRatio
    }

    canvas = document.createElement('canvas')
    canvas.width = resizedWidth
    canvas.height = resizedHeight
    const ctx = canvas.getContext('2d')

    ctx.drawImage(
      image,
      x,
      y,
      width,
      height,
      0,
      0,
      resizedWidth,
      resizedHeight
    )
  }

  return new Promise(resolve => {
    image = new Image()
    image.onload = () => {
      drawImageOnCanvas(image)
      canvas.toBlob(file => {
        file.name = imageFileObj.name
        resolve(file)
      }, 'image/jpeg')
    }
    image.src = imageSrc
  })
}

export const modifyImage = (file, options, callback) => {
  loadImage(
    file,
    (canvas, meta) => {
      canvas.toBlob(async (blob) => {
        blob.name = file.name
        const dataUri = await getDataUri(blob)

        callback(dataUri)
      }, 'image/jpeg')
    },
    options
  )
}
