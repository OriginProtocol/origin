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

const MAX_IMAGE_WIDTH = 1000
const MAX_IMAGE_HEIGHT = 1000

export const generateCroppedImage = async (imageSrc, imageFileObj, pixelCrop) => { 
  let image
  let canvas
  
  function drawImageOnCanvas(imgEl) {
    const defaultConfig = {
      x: 0,
      y: 0,
      width: imgEl.width,
      height: imgEl.height
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
