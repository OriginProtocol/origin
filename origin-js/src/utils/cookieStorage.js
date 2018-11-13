// implementation is a modification of cookied localstorage from: https://developer.mozilla.org/en-US/docs/Web/API/Storage/LocalStorage

const DEFAULT_SECONDS_TIMEOUT = 3600 * 24 * 90 // expire key in three months per Josh

export default class cookieStorage {
  constructor({ path, expireSeconds = DEFAULT_SECONDS_TIMEOUT }) {
    this.path = path
    this.expireSeconds = expireSeconds
    const cookies = typeof document === 'object' && document.cookie && document.cookie.match(/=/g)
    this.length = cookies ? cookies.length : 0
  }

  getItem(sKey) {
    if (!sKey || !this.hasOwnProperty(sKey)) {
      return null
    }
    return unescape(
      document.cookie.replace(
        new RegExp(
          '(?:^|.*;\\s*)' +
            escape(sKey).replace(/[-.+*]/g, '\\$&') +
            '\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*'
        ),
        '$1'
      )
    )
  }

  key(nKeyId) {
    return unescape(
      document.cookie
        .replace(/\s*=(?:.(?!;))*$/, '')
        .split(/\s*=(?:[^;](?!;))*[^;]?;\s*/)[nKeyId]
    )
  }

  setItem(sKey, sValue) {
    if (!sKey) {
      return
    }
    const expires = new Date()
    expires.setTime(expires.getTime() + 1000 * this.expireSeconds)
    document.cookie =
      escape(sKey) +
      '=' +
      escape(sValue) +
      '; expires=' +
      expires.toGMTString() +
      '; path=' +
      this.path
    this.length = document.cookie.match(/=/g).length
  }

  removeItem(sKey) {
    if (!sKey || !this.hasOwnProperty(sKey)) {
      return
    }
    document.cookie =
      escape(sKey) + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
    this.length--
  }

  hasOwnProperty(sKey) {
    return new RegExp(
      '(?:^|;\\s*)' + escape(sKey).replace(/[-.+*]/g, '\\$&') + '\\s*\\='
    ).test(document.cookie)
  }
}
