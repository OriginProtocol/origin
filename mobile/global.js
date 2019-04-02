require('node-libs-react-native/globals')
// Inject node globals into React Native global scope.
//global.Buffer = require('buffer').Buffer;
global.process = require('process');

if (typeof btoa === 'undefined') {
  global.btoa = function (str) {
    return new Buffer(str, 'binary').toString('base64');
  };
}

if (typeof atob === 'undefined') {
  global.atob = function (b64Encoded) {
    return new Buffer(b64Encoded, 'base64').toString('binary');
  };
}

// see https://github.com/facebook/react-native/issues/16434
import { URL, URLSearchParams } from "whatwg-url"
global.URL = URL;
global.URLSearchParams = URLSearchParams;

global.navigator.userAgent = 'React Native';
