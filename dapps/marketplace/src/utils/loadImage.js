import loadImage from 'blueimp-load-image'

loadImage.renderImageToCanvas = function(
  canvas,
  img,
  sourceX,
  sourceY,
  sourceWidth,
  sourceHeight,
  destX,
  destY,
  destWidth,
  destHeight
) {
  const context = canvas.getContext('2d')
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, destWidth, destHeight)
  context.drawImage(
    img,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    destX,
    destY,
    destWidth,
    destHeight
  )
  return canvas
}

export default loadImage
