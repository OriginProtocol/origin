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

export const getImageOrientation = async (file) => {
  const reader = new FileReader()

  return new Promise(resolve => {
    reader.onload = ({ target: { result } }) => {
      const view = new DataView(result)
      const defaultOrientation = 1

      if (result.length < 2 || view.getUint16(0, false) != 0xFFD8) {
        return resolve(defaultOrientation)
      }

      const length = view.byteLength
      let offset = 2

      while (offset < length) {
        const marker = view.getUint16(offset, false)
        const startOfExif = marker == 0xFFE1
        offset += 2

        if (startOfExif) {
          if (view.getUint32(offset += 2, false) != 0x45786966) {
            return resolve(defaultOrientation)
          }
          const littleEndian = view.getUint16(offset += 6, false) == 0x4949
          offset += view.getUint32(offset + 4, littleEndian)
          const tags = view.getUint16(offset, littleEndian)
          offset += 2

          let iterator = 0

          do {
            if (view.getUint16(offset + (iterator * 12), littleEndian) == 0x0112) {
              return resolve(view.getUint16(offset + (iterator * 12) + 8, littleEndian))
            }
            iterator += 1
          } while (iterator < tags)
        }
        else if ((marker & 0xFF00) != 0xFF00) break
        else offset += view.getUint16(offset, false)
      }
      return resolve(defaultOrientation)
    }

    reader.readAsArrayBuffer(file.slice(0, 64 * 1024))
  })
}

const rotation = {
  1: 'rotate(0deg)',
  3: 'rotate(180deg)',
  6: 'rotate(90deg)',
  8: 'rotate(270deg)'
}

export const getImageRotation = async (file) => {
  const orientation = await getImageOrientation(file)
  return rotation[orientation]
}
