function extractCallParams(web3, abi, functionSig, paramsData, inputOffset = 0) {
  for (const method of abi) {
    const sig = web3.eth.abi.encodeFunctionSignature(method)
    if (sig == functionSig)
    {
      return {
        method: method.name,
        params: web3.eth.abi.decodeParameters(method.inputs.slice(inputOffset), paramsData)
      }
    }
  }
  return {}
}

module.exports = {
  extractCallParams
}
