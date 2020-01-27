const ipfsClient = require('ipfs-http-client')

const dir = './public'

const client = ipfsClient({
  host: 'ipfs.ogn.app',
  port: '443',
  protocol: 'https'
})

const upload = async () => {
  try {
    const response = await client.addFromFs(dir, {
      recursive: true
    })
    const hash = response[response.length - 1].hash
    console.log('https://ipfs.ogn.app/ipfs/', hash)
  } catch (error) {
    console.error('Upload failed', error)
  }
}

upload()
