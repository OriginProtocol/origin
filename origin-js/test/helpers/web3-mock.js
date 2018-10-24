const EventEmitter = require('events')
class MyEmitter extends EventEmitter {}

//TODO document stuff here
export default class Web3Mock {
  constructor({
    emitReceipt = true,
    emitTransactionHash = true,
    emitConfirmation = true,
    numOfConfirmations = 3,
    gasEstimation = 1000000
  }){
    this.confirmationsEmitted = 0
    this.numOfConfirmations = numOfConfirmations

    const transactionReceipt = {
      blockNumber: 0
    }
    let emitConfirmationFcnt = (myEmitter) => {
      setTimeout(() => {
        this.confirmationsEmitted++
        myEmitter.emit('confirmation', 0, transactionReceipt)

        if (this.numOfConfirmations > this.confirmationsEmitted)
          emitConfirmationFcnt(myEmitter)
      } , 130)
    }

    this.eth = {
      defaultAccount: null,
      net: {
        getId: async function(){
          return 999
        }
      },
      getAccounts: async function(){
        return [
          '0x78569a0C0725A906A872706bE762dd1732A6CD70'
        ]
      },
      getBlock: async function(blockNumner){
        return {
          timestamp: Date.now() / 1000
        }
      },
      getBlockNumber: async function(){
        return 0
      },
      getTransactionReceipt: (hash) => {
        return transactionReceipt
      },
      Contract: function(abi, address){
        return {
          options: {
            address: address
          },
          getPastEvents: function(eventTypes, options){
            return []
          },
          methods: {
            addClaims: function(contract, args){
              return {
                _method: {
                  constant: false
                },
                estimateGas: function (options){
                  return gasEstimation
                },
                send: function(options){
                  const myEmitter = new MyEmitter()

                  if (emitReceipt){
                    setTimeout(() => {
                      myEmitter.emit('receipt', transactionReceipt)
                    } , 120)
                  }

                  if (emitTransactionHash){
                    setTimeout(() => {
                      myEmitter.emit('transactionHash', '0x1234567890123456789012345678901234567890')
                    } , 122)
                  }

                  if (emitConfirmation){
                    emitConfirmationFcnt(myEmitter)
                  }

                  return myEmitter
                }
              }
            }
          }
        }
      }
    }
  }
}