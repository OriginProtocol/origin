// Grab NODE_ENV and REACT_APP_* environment variables and prepare them to be
// injected into the application via DefinePlugin in Webpack configuration.

var REACT_APP = /^REACT_APP_/i;

function getClientEnvironment(publicUrl) {
  debugger;
  var processEnv = Object
    .keys(process.env)
    .filter(key => REACT_APP.test(key))
    .reduce((env, key) => {
      env[key] = JSON.stringify(process.env[key]);
      return env;
    }, {
      // Useful for determining whether we’re running in production mode.
      // Most importantly, it switches React into the correct mode.
      'NODE_ENV': JSON.stringify(
        process.env.NODE_ENV || 'development'
      ),
      // Useful for resolving the correct path to static assets in `public`.
      // For example, <img src={process.env.PUBLIC_URL + '/img/logo.png'} />.
      // This should only be used as an escape hatch. Normally you would put
      // images into the `src` and `import` them in code to get their paths.
      'PUBLIC_URL': JSON.stringify(publicUrl),
      // To use a local IPFS daemon, set IPFS_DOMAIN env var to 127.0.01
      // and IPFS_API_PORT env var to 5001
      'IPFS_API_PORT': JSON.stringify(process.env.IPFS_API_PORT || "5002"),
      'IPFS_DOMAIN': JSON.stringify(process.env.IPFS_DOMAIN || "gateway.originprotocol.com")
    });
  return {'process.env': processEnv};
}

module.exports = getClientEnvironment;
