import { post } from '@origin/ipfs'

async function addObject(jsObject) {
  return await post('http://localhost:5002', jsObject)
}

export default {
    addObject
}
