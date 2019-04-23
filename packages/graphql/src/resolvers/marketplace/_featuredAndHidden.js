import fetch from 'cross-fetch'
const memoize = require('lodash/memoize')

async function getFeaturedFn(net) {
  if (net === 'localhost') return [1]
  let netId
  if (net === 'mainnet') netId = 1
  if (net === 'rinkeby') netId = 4
  if (!netId) return []

  return await new Promise(resolve => {
    fetch(
      `https://cdn.jsdelivr.net/gh/originprotocol/origin@hidefeature_list/featurelist_${netId}.txt`
    )
      .then(response => response.text())
      .then(response => {
        const ids = response
          .split(',')
          .map(i => Number(i.split('-')[2].replace(/[^0-9]/g, '')))

        resolve(ids)
      })
      .catch(() => resolve([]))
  })
}

async function getHiddenFn(net) {
  let netId
  if (net === 'mainnet') netId = 1
  if (net === 'rinkeby') netId = 4
  if (!netId) return []

  return await new Promise(resolve => {
    fetch(
      `https://cdn.jsdelivr.net/gh/originprotocol/origin@hidefeature_list/hidelist_${netId}.txt`
    )
      .then(response => response.text())
      .then(response => {
        const ids = response
          .split(',')
          .map(i => Number(i.split('-')[2].replace(/[^0-9]/g, '')))

        resolve(ids)
      })
      .catch(() => resolve([]))
  })
}

export const getFeatured = memoize(getFeaturedFn)
export const getHidden = memoize(getHiddenFn)
