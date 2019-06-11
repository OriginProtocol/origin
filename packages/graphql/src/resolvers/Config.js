const ORIGIN_GQL_VERSION = require('../../package.json').version

export default {
  originGraphQLVersion: () => {
    return ORIGIN_GQL_VERSION
  }
}
