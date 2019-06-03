import { ApolloLink } from 'apollo-link'
import { SubscriptionClient } from 'subscriptions-transport-ws'

import { subscribe, parse, specifiedRules, validate } from 'graphql'

import {
  $$asyncIterator,
  isAsyncIterable,
  createAsyncIterator,
  forAwaitEach
} from 'iterall'

import schema from './schema'

const MessageTypes = {
  GQL_START: 'start',
  GQL_STOP: 'stop',
  GQL_DATA: 'data',
  GQL_ERROR: 'error',
  GQL_COMPLETE: 'complete'
}

const createEmptyIterable = () => ({
  next: () => Promise.resolve({ value: undefined, done: true }),
  return: () => Promise.resolve({ value: undefined, done: true }),
  throw: e => Promise.reject(e),
  [$$asyncIterator]: () => this
})

const createIterableFromPromise = promise => {
  let isResolved = false

  return promise.then(value => {
    if (isAsyncIterable(value)) {
      return value
    }

    return {
      next: () => {
        if (!isResolved) {
          isResolved = true
          return Promise.resolve({ value, done: false })
        }
        return Promise.resolve({ value: undefined, done: true })
      },
      return: () => {
        isResolved = true
        return Promise.resolve({ value: undefined, done: true })
      },
      throw: e => {
        isResolved = true
        return Promise.reject(e)
      },
      [$$asyncIterator]: () => this
    }
  })
}

let _onMessage

const getOnMessage = ({ schema, context, onMessageReceived }) => {
  if (_onMessage) return _onMessage

  const sendMessage = (opId, type, payload) => {
    onMessageReceived(
      JSON.stringify({
        type,
        id: opId,
        payload
      })
    )
  }

  const sendError = (opId, errorPayload) => {
    sendMessage(opId, MessageTypes.GQL_ERROR, errorPayload)
  }

  const connectionContext = {
    isLegacy: false,
    operations: {}
  }

  const unsubscribe = opId => {
    if (connectionContext.operations && connectionContext.operations[opId]) {
      if (connectionContext.operations[opId].return) {
        connectionContext.operations[opId].return()
      }

      delete connectionContext.operations[opId]
    }
  }

  _onMessage = workerMessage => {
    const message = JSON.parse(workerMessage.data)
    const opId = message.id
    if (typeof opId !== 'undefined') {
      switch (message.type) {
        case MessageTypes.GQL_STOP:
          unsubscribe(opId)
          break

        case MessageTypes.GQL_START: {
          unsubscribe(opId)

          const baseParams = {
            query: message.payload.query,
            variables: message.payload.variables,
            operationName: message.payload.operationName,
            context,
            formatResponse: undefined,
            formatError: undefined,
            callback: undefined
          }
          const promisedParams = Promise.resolve(baseParams)

          // set an initial mock subscription to only registering opId
          connectionContext.operations[opId] = createEmptyIterable()

          promisedParams
            .then(params => {
              if (typeof params !== 'object') {
                const error = `Invalid params returned from onOperation! return values must be an object!`
                throw new Error(error)
              }
              const document =
                typeof baseParams.query !== 'string'
                  ? baseParams.query
                  : parse(baseParams.query)
              let executionIterable
              const validationErrors = validate(
                schema,
                document,
                specifiedRules
              )
              if (validationErrors.length > 0) {
                executionIterable = Promise.resolve(
                  createIterableFromPromise(
                    Promise.resolve({ errors: validationErrors })
                  )
                )
              } else {
                const executor = subscribe
                const promiseOrIterable = executor(
                  schema,
                  document,
                  {},
                  params.context,
                  params.variables,
                  params.operationName
                )

                if (
                  !isAsyncIterable(promiseOrIterable) &&
                  promiseOrIterable instanceof Promise
                ) {
                  executionIterable = promiseOrIterable
                } else if (isAsyncIterable(promiseOrIterable)) {
                  executionIterable = Promise.resolve(promiseOrIterable)
                } else {
                  throw new Error(
                    'Invalid `execute` return type! Only Promise or AsyncIterable are valid values!'
                  )
                }
              }

              return executionIterable.then(ei => ({
                executionIterable: isAsyncIterable(ei)
                  ? ei
                  : createAsyncIterator([ei]),
                params
              }))
            })
            .then(({ executionIterable, params }) => {
              forAwaitEach(createAsyncIterator(executionIterable), value => {
                let result = value
                if (params.formatResponse) {
                  try {
                    result = params.formatResponse(value, params)
                  } catch (err) {
                    console.error('Error in formatError function:', err)
                  }
                }
                sendMessage(opId, MessageTypes.GQL_DATA, result)
              })
                .then(() => {
                  sendMessage(opId, MessageTypes.GQL_COMPLETE, null)
                })
                .catch(e => {
                  let error = e

                  if (params.formatError) {
                    try {
                      error = params.formatError(e, params)
                    } catch (err) {
                      console.error('Error in formatError function: ', err)
                    }
                  }

                  // plain Error object cannot be JSON stringified.
                  if (Object.keys(e).length === 0) {
                    error = { name: e.name, message: e.message }
                  }

                  sendError(opId, error)
                })

              return executionIterable
            })
            .then(subscription => {
              connectionContext.operations[opId] = subscription
            })
            .catch(e => {
              if (e.errors) {
                sendMessage(opId, MessageTypes.GQL_DATA, { errors: e.errors })
              } else {
                sendError(opId, { message: e.message })
              }
              unsubscribe(opId)
              return
            })
          break
        }

        default:
          sendError(opId, { message: 'Invalid message type!' })
      }
    }
  }

  return _onMessage
}

const handleSubscriptions = ({ message, schema, context, onMessageReceived }) =>
  getOnMessage({ schema, context, onMessageReceived })(message)

let onMessageReceived

function doHandle(message) {
  handleSubscriptions({
    message: { data: message },
    schema,
    context,
    onMessageReceived
  })
}

class WorkerInterface {
  send(serializedMessage) {
    doHandle(serializedMessage)
  }
  set onmessage(fn) {
    onMessageReceived = data => fn({ data })
  }
}

class SubscriptionsLink extends ApolloLink {
  constructor() {
    super()
    this.subscriptionClient = new SubscriptionClient(null, {}, WorkerInterface)
  }
  request(operation) {
    return this.subscriptionClient.request(operation)
  }
}

export default SubscriptionsLink
