const map = require('async/map')
const eachSeries = require('async/eachSeries')

module.exports = Web3ProviderEngine

function Web3ProviderEngine() {
  const self = this
  self._providers = []
}

Web3ProviderEngine.prototype.addProvider = function(source, index) {
  const self = this
  if (typeof index === 'number') {
    self._providers.splice(index, 0, source)
  } else {
    self._providers.push(source)
  }
  source.setEngine(this)
}

Web3ProviderEngine.prototype.removeProvider = function(source) {
  const self = this
  const index = self._providers.indexOf(source)
  if (index < 0) throw new Error('Provider not found.')
  self._providers.splice(index, 1)
}

Web3ProviderEngine.prototype.send = function() {
  throw new Error('Web3ProviderEngine does not support synchronous requests.')
}

Web3ProviderEngine.prototype.sendAsync = function(payload, cb) {
  const self = this
  if (Array.isArray(payload)) {
    // handle batch
    map(payload, self._handleAsync.bind(self), cb)
  } else {
    // handle single
    self._handleAsync(payload, cb)
  }
}

// private

Web3ProviderEngine.prototype._handleAsync = function(payload, finished) {
  const self = this
  let currentProvider = -1
  let result = null
  let error = null

  const stack = []

  next()

  function next(after) {
    currentProvider += 1
    stack.unshift(after)

    // Bubbled down as far as we could go, and the request wasn't
    // handled. Return an error.
    if (currentProvider >= self._providers.length) {
      end(
        new Error(
          'Request for method "' +
            payload.method +
            '" not handled by any subprovider. Please check your subprovider configuration to ensure this method is handled.'
        )
      )
    } else {
      try {
        const provider = self._providers[currentProvider]
        provider.handleRequest(payload, next, end)
      } catch (e) {
        end(e)
      }
    }
  }

  function end(_error, _result) {
    error = _error
    result = _result

    eachSeries(
      stack,
      function(fn, callback) {
        if (fn) {
          fn(error, result, callback)
        } else {
          callback()
        }
      },
      function() {
        // console.log('COMPLETED:', payload)
        // console.log('RESULT: ', result)

        const resultObj = {
          id: payload.id,
          jsonrpc: payload.jsonrpc,
          result: result
        }

        if (error != null) {
          resultObj.error = {
            message: error.stack || error.message || error,
            code: -32000
          }
          // respond with both error formats
          finished(error, resultObj)
        } else {
          finished(null, resultObj)
        }
      }
    )
  }
}
