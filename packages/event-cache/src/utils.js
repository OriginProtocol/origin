import createDebug from 'debug'

export const debug = createDebug('event-cache')

/*
 * Pull a single Event definition from a contract ABI
 *
 * @param abi {Array} of objects, representing the ABI
 * @param eventName {string} name of the event
 * @returns {object} The event definition
 */
function getEventDef(abi, eventName) {
  for (let i = 0; i < abi.length; i++) {
    if (!abi[i].type || abi[i].type !== 'event') continue
    if (abi[i].name === eventName) return abi[i]
    return null
  }
}

/*
 * Get an array of input names from a single event ABI definition
 *
 * @param abi {object} representing the ABI of the single Event
 * @returns {Array} of input names
 */
function getInputsFromDef(abi) {
  return abi.inputs.map(inp => inp.name)
}

/*
 * Validate that the given get() parameters match the event ABI
 *
 * @param contract {web3.eth.Contract} The contrat being referenced
 * @param params {object} The params given to get()
 */
export function validateParams(contract, params) {
  if (!params) return {}

  const availableEvents = Object.keys(contract.events)

  if (params.event && !availableEvents.includes(params.event)) {
    return false
  }

  // According to the 1.0 docs jsonInterface is a thing, but... not in beta 34?
  // const eventDef = contract.jsonInterface.getEvent(params.event)
  // const inputs = eventDef.getInputs().map(inp => inp.name)

  // So instead, we're using an internal undocumented 'API' here, so beware
  const eventDef = getEventDef(contract._jsonInterface, params.event)
  const inputs = getInputsFromDef(eventDef)

  return Object.keys(params).every(param => {
    if (param === 'event') return true
    if (inputs.includes(param)) return true
    return false
  })
}
