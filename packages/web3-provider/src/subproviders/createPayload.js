function createRandomId() {
  const datePart = new Date().getTime() * 1000
  const extraPart = Math.floor(Math.random() * 1000)
  return datePart + extraPart
}

const createPayload = data => ({
  id: createRandomId(),
  jsonrpc: '2.0',
  params: [],
  ...data
})

module.exports = createPayload
