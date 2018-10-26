function decodeMethodCall(abi, callData) {
  const abiDecoder = require('abi-decoder')
  abiDecoder.add(abi)
  return abiDecoder.decodeMethod(abi)
}

function extractCallParams(web3, abi, functionSig, paramsData, inputOffset = 1) {
  for (const method of abi) {
    const sig = web3.eth.abi.encodeFunctionSignature(method)
    if (sig == functionSig)
    {
      return {name:method.name, params:web3.eth.abi.decodeParameters(method.inputs.slice(inputOffset), paramsData)}
    }
  }
}

module.exports = {
  decodeMethodCall,
  extractCallParams
}
