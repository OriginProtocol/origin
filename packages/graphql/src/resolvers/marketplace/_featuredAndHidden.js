import fetch from 'cross-fetch'

const featured = {},
  hidden = {},
  queues = {}

class Queue {
  constructor() {
    this.fetching = false
    this.requestQueue = []
  }
  async isDone() {
    return new Promise(resolve => this.requestQueue.push(resolve))
  }
}

export async function getFeatured(net) {
  if (net === 'localhost') return [1]
  let netId
  if (net === 'mainnet') netId = 1
  if (net === 'rinkeby') netId = 4
  if (!netId) return []

  if (featured[netId]) return featured[netId]

  queues.featured = queues.featured || new Queue()
  if (queues.featured.fetching) await queues.featured.isDone()
  queues.featured.fetching = true

  if (hidden[netId]) return hidden[netId]

  return await new Promise(resolve => {
    fetch(
      `https://cdn.jsdelivr.net/gh/originprotocol/origin@hidefeature_list/featurelist_${netId}.txt`
    )
      .then(response => response.text())
      .then(response => {
        const ids = response
          .split(',')
          .map(i => Number(i.split('-')[2].replace(/[^0-9]/g, '')))
        featured[netId] = ids

        queues.featured.fetching = false
        while (queues.featured.requestQueue.length) {
          queues.featured.requestQueue.pop()()
        }

        resolve(ids)
      })
      .catch(() => resolve([]))
  })
}

export async function getHidden(net) {
  let netId
  if (net === 'mainnet') netId = 1
  if (net === 'rinkeby') netId = 4
  if (!netId) return []

  if (hidden[netId]) return hidden[netId]

  queues.hidden = queues.hidden || new Queue()
  if (queues.hidden.fetching) await queues.hidden.isDone()
  queues.hidden.fetching = true

  if (hidden[netId]) return hidden[netId]

  return await new Promise(resolve => {
    fetch(
      `https://cdn.jsdelivr.net/gh/originprotocol/origin@hidefeature_list/hidelist_${netId}.txt`
    )
      .then(response => response.text())
      .then(response => {
        const ids = response
          .split(',')
          .map(i => Number(i.split('-')[2].replace(/[^0-9]/g, '')))
        hidden[netId] = ids

        queues.hidden.fetching = false
        while (queues.hidden.requestQueue.length) {
          queues.hidden.requestQueue.pop()()
        }
        resolve(ids)
      })
      .catch(() => resolve([]))
  })
}
