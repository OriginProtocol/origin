import loadImage from 'utils/loadImage'
import { fileSize, postFile } from 'utils/fileUtils'

export const acceptedFileTypes = [
  'image/jpeg',
  'image/pjpeg',
  'image/png',
  'image/webp'
]

/**
 * Uploads an array of image files to IPFS.
 * Resizes images down to a maximum size if they are too big.
 * Returns file information, IPFS hash, and base64 encoded data urls
 * @param {string} ipfsRPC 
 * @param {File[]} files
 */

export async function uploadImages(ipfsRPC, files) {
  const newImages = []
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const newFile = await new Promise(resolve => {
      loadImage(file, img => img.toBlob(blob => resolve(blob), 'image/jpeg'), {
        orientation: true,
        maxWidth: 2000,
        maxHeight: 2000
      })
    })
    if (acceptedFileTypes.indexOf(newFile.type) >= 0) {
      const hash = await postFile(ipfsRPC, newFile, newFile.type)
      newImages.push({
        contentType: file.type,
        size: fileSize(file.size),
        name: file.name,
        src: window.URL.createObjectURL(newFile),
        urlExpanded: window.URL.createObjectURL(newFile),
        hash,
        url: `ipfs://${hash}`
      })
    }
  }
  return newImages
}
