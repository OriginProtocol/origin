import invert from 'lodash/invert'

function getProxies() {
  try {
    const parsed = JSON.parse(window.localStorage.walletToProxy)
    if (typeof parsed === 'object') {
      return parsed
    }
  } catch (e) {
    /* Ignore */
  }
  return {}
}

function getOwners() {
  return invert(getProxies())
}

export function proxyOrWallet(wallet) {
  const proxies = getProxies()
  return proxies[wallet] || wallet
}

export function proxyOwnerOrNull(proxy) {
  const owners = getOwners()
  return owners[proxy]
}

export function isProxy(proxy) {
  const owners = getOwners()
  return owners[proxy] ? true : false
}

export function setProxy(wallet, proxy) {
  const proxies = getProxies()
  proxies[wallet] = proxy
  window.localStorage.walletToProxy = JSON.stringify(proxies)
}
