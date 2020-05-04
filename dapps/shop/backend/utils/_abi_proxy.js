module.exports = [
  {
    constant: false,
    inputs: [
      {
        name: '_owner',
        type: 'address'
      },
      {
        name: '_marketplace',
        type: 'address'
      },
      {
        name: '_offer',
        type: 'bytes'
      },
      {
        name: '_exchange',
        type: 'address'
      },
      {
        name: '_swap',
        type: 'bytes'
      },
      {
        name: '_token',
        type: 'address'
      },
      {
        name: '_value',
        type: 'uint256'
      }
    ],
    name: 'swapAndMakeOffer',
    outputs: [],
    payable: true,
    stateMutability: 'payable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      {
        name: '_owner',
        type: 'address'
      },
      {
        name: '_marketplace',
        type: 'address'
      },
      {
        name: '_offer',
        type: 'bytes'
      },
      {
        name: '_token',
        type: 'address'
      },
      {
        name: '_value',
        type: 'uint256'
      }
    ],
    name: 'transferTokenMarketplaceExecute',
    outputs: [],
    payable: true,
    stateMutability: 'payable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      {
        name: '_operationType',
        type: 'uint256'
      },
      {
        name: '_to',
        type: 'address'
      },
      {
        name: '_value',
        type: 'uint256'
      },
      {
        name: '_data',
        type: 'bytes'
      }
    ],
    name: 'execute',
    outputs: [],
    payable: true,
    stateMutability: 'payable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      {
        name: 'to',
        type: 'address'
      },
      {
        name: 'sign',
        type: 'bytes'
      },
      {
        name: 'signer',
        type: 'address'
      },
      {
        name: 'data',
        type: 'bytes'
      }
    ],
    name: 'forward',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [
      {
        name: '_key',
        type: 'bytes32'
      }
    ],
    name: 'getData',
    outputs: [
      {
        name: '_value',
        type: 'bytes32'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [
      {
        name: '',
        type: 'address'
      }
    ],
    name: 'nonce',
    outputs: [
      {
        name: '',
        type: 'uint256'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      {
        name: '_key',
        type: 'bytes32'
      },
      {
        name: '_value',
        type: 'bytes32'
      }
    ],
    name: 'setData',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [
      {
        name: 'signer',
        type: 'address'
      },
      {
        name: 'to',
        type: 'address'
      },
      {
        name: 'value',
        type: 'uint256'
      },
      {
        name: 'data',
        type: 'bytes'
      }
    ],
    name: 'getHash',
    outputs: [
      {
        name: '',
        type: 'bytes32'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      {
        name: '_currency',
        type: 'address'
      },
      {
        name: '_value',
        type: 'uint256'
      }
    ],
    name: 'transferToOwner',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'owner',
    outputs: [
      {
        name: '',
        type: 'address'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      {
        name: '_owner',
        type: 'address'
      },
      {
        name: '_to',
        type: 'address'
      },
      {
        name: '_value',
        type: 'uint256'
      },
      {
        name: '_data',
        type: 'bytes'
      }
    ],
    name: 'changeOwnerAndExecute',
    outputs: [],
    payable: true,
    stateMutability: 'payable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      {
        name: '_owner',
        type: 'address'
      }
    ],
    name: 'changeOwner',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      {
        name: '_owner',
        type: 'address'
      },
      {
        name: '_marketplace',
        type: 'address'
      },
      {
        name: '_offer',
        type: 'bytes'
      },
      {
        name: '_token',
        type: 'address'
      },
      {
        name: '_value',
        type: 'uint256'
      }
    ],
    name: 'marketplaceExecute',
    outputs: [],
    payable: true,
    stateMutability: 'payable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      {
        name: '_marketplace',
        type: 'address'
      },
      {
        name: '_finalize',
        type: 'bytes'
      },
      {
        name: '_seller',
        type: 'address'
      },
      {
        name: '_currency',
        type: 'address'
      },
      {
        name: '_value',
        type: 'uint256'
      }
    ],
    name: 'marketplaceFinalizeAndPay',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    payable: true,
    stateMutability: 'payable',
    type: 'fallback'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: 'sig',
        type: 'bytes'
      },
      {
        indexed: false,
        name: 'signer',
        type: 'address'
      },
      {
        indexed: false,
        name: 'destination',
        type: 'address'
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256'
      },
      {
        indexed: false,
        name: 'data',
        type: 'bytes'
      },
      {
        indexed: false,
        name: '_hash',
        type: 'bytes32'
      }
    ],
    name: 'Forwarded',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'key',
        type: 'bytes32'
      },
      {
        indexed: true,
        name: 'value',
        type: 'bytes32'
      }
    ],
    name: 'DataChanged',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'ownerAddress',
        type: 'address'
      }
    ],
    name: 'OwnerChanged',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'contractAddress',
        type: 'address'
      }
    ],
    name: 'ContractCreated',
    type: 'event'
  }
]
