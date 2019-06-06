const createDebug = require('debug')

const debug = createDebug('event-cache')

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
  }
  return null
}

/*
 * Pull all Event definitions from a contract ABI
 *
 * @param abi {Array} of objects, representing the ABI
 * @returns {object} The event definition
 */
function getAllEventsDef(abi) {
  const defs = new Set()
  for (let i = 0; i < abi.length; i++) {
    if (!abi[i].type || abi[i].type !== 'event') continue
    defs.add(abi[i])
  }
  return defs
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
function validateParams(contract, params) {
  if (!params) return {}

  const availableEvents = Object.keys(contract.events)

  if (params.event) {
    if (params.event instanceof Array) {
      if (!params.event.every(ev => availableEvents.includes(ev))) {
        console.warning('At least one event does not exist in contract')
        return false
      }
    } else if (!availableEvents.includes(params.event)) {
      console.warning(`event does not exist in contract`)
      debug(`expected ${params.event}`)
      return false
    }
  }

  // According to the 1.0 docs jsonInterface is a thing, but... not in beta 34?
  // const eventDef = contract.jsonInterface.getEvent(params.event)
  // const inputs = eventDef.getInputs().map(inp => inp.name)

  // So instead, we're using an internal undocumented 'API' here, so beware
  let inputs = new Set()
  if (params.event) {
    if (params.event instanceof Array) {
      params.event.map(ev => {
        const eventDef = getEventDef(contract._jsonInterface, ev)
        const foundInputs = getInputsFromDef(eventDef)
        foundInputs.map(inp => inputs.add(inp))
      })
    } else {
      const eventDef = getEventDef(contract._jsonInterface, params.event)
      if (!eventDef) {
        console.error(
          `Unable to find event definition in ABI, but it is defined in Contract object. This probably shouldln't happen.`
        )
      } else {
        inputs = new Set(getInputsFromDef(eventDef))
      }
    }
  } else {
    // No specific event(s), get all possible inputs
    const defs = getAllEventsDef(contract._jsonInterface)
    if (defs) {
      defs.forEach(ev => {
        const ins = getInputsFromDef(ev)
        ins.map(_input => inputs.add(_input))
      })
    }
  }
  return Object.keys(params).every(param => {
    if (param === 'event') return true
    if (inputs.has(param)) return true
    debug('param does not match contract')
    return false
  })
}

/**
 * Sorting for events
 *
 * @param key {string} key name, can include dot notation
 * @returns {any} value
 */
function compareEvents(a, b) {
  if (a.blockNumber < b.blockNumber) return -1
  if (a.blockNumber > b.blockNumber) return 1
  if (a.transactionIndex < b.transactionIndex) return -1
  if (a.transactionIndex > b.transactionIndex) return 1
  if (a.logIndex < b.logIndex) return -1
  if (a.logIndex > b.logIndex) return 1
  return 0
}

module.exports = {
  debug,
  validateParams,
  compareEvents
}
