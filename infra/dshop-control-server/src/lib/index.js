const ipfsClient = require('ipfs-http-client')

const ipfs = ipfsClient(process.env.IPFS_API_URL)

const linkFile = async (ref, path, name) => {
  const response = await ipfs.addFromFs(path)
  const link = {
    name: name,
    size: response[0].size,
    cid: response[0].hash
  }
  const cid = await ipfs.object.patch.addLink(ref, link)
  return cid.toString()
}

const linkDir = async (ref, path, name) => {
  // Add recursively
  const response = await ipfs.addFromFs(path, { recursive: true })
  // Directory is the last object returned in recursive add of directory
  const last = response[response.length - 1]
  const link = {
    name: name,
    size: last.size,
    cid: last.hash
  }
  const cid = await ipfs.object.patch.addLink(ref, link)
  return cid.toString()
}

module.exports = {
  ipfs,
  linkFile,
  linkDir
}
