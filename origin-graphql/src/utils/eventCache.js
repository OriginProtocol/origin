export default function eventCache(contract, fromBlock = 0) {
  let events = [],
    toBlock = 0,
    lastLookup = 0,
    processing = false,
    queue = []

  // try {
  //   ({ events, lastLookup } = JSON.parse(
  //     window.localStorage.eventCache
  //   ))
  //   fromBlock = lastLookup + 1
  // } catch (e) {
  //   /* Ignore */
  // }

  function updateBlock(block) {
    toBlock = block
  }

  const isDone = () => new Promise(resolve => queue.push(resolve))

  async function getPastEvents() {
    if (processing) {
      await isDone()
    }
    if (lastLookup && lastLookup === toBlock) {
      return
    }
    processing = true
    if (!toBlock) {
      toBlock = await web3.eth.getBlockNumber()
    }
    lastLookup = toBlock
    const newEvents = await contract.getPastEvents('allEvents', {
      fromBlock,
      toBlock
    })

    events = [
      ...events,
      ...newEvents.map(e => ({ ...e, block: { id: e.blockNumber } }))
    ]
    if (typeof window !== 'undefined') {
      window.localStorage.eventCache = JSON.stringify({
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
