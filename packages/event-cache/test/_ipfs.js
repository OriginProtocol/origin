const { post } = require('@origin/ipfs')

async function addObject(jsObject) {
  return await post('http://localhost:5002', jsObject)
}

module.exports = {
    addObject
}
