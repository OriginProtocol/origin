export default function eventCache(contract, fromBlock = 0) {

  let events = [],
    toBlock = 0,
    lastLookup = 0,
    processing = false,
    queue = []

  function updateBlock(block) {
    console.log("Update block", block)
    toBlock = block
  }

  if (!contract.options.address) { return { updateBlock } }

  let cacheStr = `eventCache${contract.options.address.slice(2, 8)}`

  try {
    ({ events, lastLookup } = JSON.parse(
      window.localStorage[cacheStr]
    ))
    fromBlock = lastLookup
  } catch (e) {
    /* Ignore */
  }

  const isDone = () => new Promise(resolve => queue.push(resolve))

  async function getPastEvents() {
    if (processing) {
      await isDone()
    }
    if (!toBlock) {
      toBlock = await web3.eth.getBlockNumber()
    }
    if (lastLookup && lastLookup === toBlock) {
      return
    }
    if (lastLookup === fromBlock) {
      fromBlock += 1
    }
    processing = true
    console.log(`Fetching events from ${fromBlock} to ${toBlock}, last lookup ${lastLookup}`)
    lastLookup = toBlock

    const newEvents = await contract.getPastEvents('allEvents', {
      fromBlock,
      toBlock
    })

    events = [
      ...events,
      ...newEvents.map(e => ({ ...e, block: { id: e.blockNumber } }))
    ]

    console.log(`Found ${events.length} events, ${newEvents.length} new`)

    if (typeof window !== 'undefined') {
      window.localStorage[cacheStr] = JSON.stringify({
        lastLookup,
        events
      })
    }

    fromBlock = toBlock + 1
    processing = false
    while(queue.length) {
      queue.pop()()
    }
  }

  async function allEvents(eventName) {
    await getPastEvents()
    return events.filter(e => {
      return eventName ? e.event === eventName : true
    })
  }

  async function listings(listingId, eventName) {
    await getPastEvents()
    var listingTopic = web3.utils.padLeft(web3.utils.numberToHex(listingId), 64)
    return events.filter(e => {
      const topics = e.raw.topics
      return (
        topics[2] === listingTopic && (eventName ? e.event === eventName : true)
      )
    })
  }

  async function offers(listingId, offerId, eventName) {
    await getPastEvents()
    var listingTopic = web3.utils.padLeft(web3.utils.numberToHex(listingId), 64)
    var offerTopic = web3.utils.padLeft(web3.utils.numberToHex(offerId), 64)
    return events.filter(e => {
      const topics = e.raw.topics
      return (
        topics[2] === listingTopic &&
        topics[3] === offerTopic &&
        (eventName ? e.event === eventName : true)
      )
    })
  }

  return { listings, offers, allEvents, updateBlock }
}
