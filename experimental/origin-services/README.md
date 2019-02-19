# Origin Services

Provides Ganache and IPFS services for use when developing locally or for running tests.

## Usage

    const services = require('origin-services')

    const shutdown = await services({ ganache: true, ipfs: true })

    // Do operations...

    shutdown()
