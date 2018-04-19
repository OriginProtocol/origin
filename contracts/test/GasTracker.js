const ENABLE_GAS_TRACKING = process.env.GAS_TRACKING != undefined
const GAS_COST = process.env.GAS_COST || 4
const ETH_USD = process.env.ETH_USD || 700

// This module shows the actual gas amounts used for each Ethereum transaction.
// Currently, it just displays the costs inline during the tests as the transactions occur.
//
// To enable this, set the GAS_TRACKING enviroment variable before running your tests:
//
// If using BASH: `GAS_TRACKING=1 truffle test`
// If using FISH: `env GAS_TRACKING=1 truffle test`
//
// --
//
// Future work:
// - Nice html and csv output
// - Track contracts created with `.at`, not just ones created with `.new`
// - Make sure everything works with deliberately failed transactions.

class GasTracker {
  constructor() {
    this.gasCosts = {}
  }

  // This wraps truffle's built in `artifacts` module so that when you `.require` a contract
  // definition from it, then call `.new`, the contract you get has each transaction method
  // wrapped for logging.
  trackArtifacts(artifacts) {
    if (artifacts._gasTracking == true) {
      return
    }
    artifacts._gasTracking = true

    const tracker = this
    const oldRequire = artifacts.require
    artifacts.require = function(...requireArgs) {
      const contractConstructor = oldRequire.apply(artifacts, requireArgs)
      const oldNew = contractConstructor.new
      contractConstructor.new = function(...constructorArgs) {
        const newContractPromise = oldNew.apply(
          contractConstructor,
          constructorArgs
        )
        newContractPromise.then(function(newContract) {
          tracker.trackContract(newContract)
        })
        return newContractPromise
      }
      return contractConstructor
    }
  }

  // Finds all transactions and wraps them for gas logging
  trackContract(truffleContract) {
    const contractName = truffleContract.constructor.contractName
    const contract = truffleContract.contract

    // Wrap functions
    truffleContract.contract.abi
      .filter(item => item.type == "function" && item.stateMutability != "view")
      .forEach(item => {
        const oldFn = truffleContract[item.name]
        const newFn = this.trackTransaction(truffleContract, item, oldFn)
        newFn.call = oldFn.call
        newFn.sendTransaction = this.trackTransaction(
          truffleContract,
          item,
          oldFn.sendTransaction
        )
        newFn.request = oldFn.request
        newFn.estimateGas = oldFn.estimateGas

        truffleContract[item.name] = newFn
      })
  }

  // Wrap an individual transaction function for gas logging
  trackTransaction(truffleContract, item, oldFn) {
    const tracker = this
    return function(...args) {
      var resultsPromise = oldFn.apply(this, args)
      resultsPromise
        .then(function(results) {
          const contractName = truffleContract.constructor.contractName
          const metricName = contractName + "." + item.name
          if (results.receipt != undefined) {
            tracker.recordGas(metricName, results.receipt.gasUsed)
          } else {
            const web3 = truffleContract.constructor.web3
            web3.eth.getTransactionReceipt(results, function(erorr, receipt) {
              tracker.recordGas(metricName, receipt.gasUsed)
            })
          }
        })
        .catch(function(err) {})
      return resultsPromise
    }
  }

  // Store/Display gas costs
  recordGas(name, gas) {
    console.log(
      "> Transaction", // For easy GREPing
      "$" + this.gasUSD(gas).toFixed(2), // Dollars/cents
      name, // Name
      gas.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    ) // Gwei, with thousands seperator
    if (this.gasCosts[name] == undefined) {
      this.gasCosts[name] = []
    }
    this.gasCosts[name].push(gas)
  }

  // Convert gas costs to USD
  gasUSD(gas) {
    return gas * GAS_COST / 1000000000 * ETH_USD
  }
}

gasTrackerInstance = new GasTracker()
// If this file is run in truffle tests, automaticly wrap the global artifacts
if (artifacts && ENABLE_GAS_TRACKING) {
  gasTrackerInstance.trackArtifacts(artifacts)
}
module.exports = gasTrackerInstance
