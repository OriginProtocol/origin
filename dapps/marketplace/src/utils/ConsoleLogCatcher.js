import prune from 'json-prune'

const ConsoleLogCatcher = () => {
  const methods = ['log', 'debug', 'info', 'warn', 'error']
  // only re-route origin methods once. Since ConsoleLogCatcher can be called multiple times
  if (!console.originalMethods) {
    console.originalMethods = {}
    methods.forEach(method => {
      if (console[method] !== undefined) {
        console.originalMethods[method] = console[method]
      }
    })
  }

  const register = (method, callback) => {
    console[method] = function() {
      let finalMsg = ''
      Array.from(arguments).forEach(argument => {
        if (typeof argument === 'object') {
          finalMsg += prune(argument)
        } else {
          finalMsg += argument + '' // "safe toString()" (works with null & undefined)
        }
      })

      console.originalMethods[method].apply(console, arguments)
      callback(method, finalMsg)
    }
  }

  return {
    connect: callback => {
      methods.forEach(method => {
        register(method, callback)
      })
    }
  }
}

export default ConsoleLogCatcher
