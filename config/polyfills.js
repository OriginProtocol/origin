if (typeof Promise === 'undefined') {
  // Rejection tracking prevents a common issue where React gets into an
  // inconsistent state due to an error, but it gets swallowed by a Promise,
  // and the user has no idea what causes React's erratic future behavior.
  require('promise/lib/rejection-tracking').enable();
  window.Promise = require('promise/lib/es6-extensions.js');
}

// fetch() polyfill for making API calls.
require('whatwg-fetch');

// Object.assign() is commonly used with React.
// It will use the native implementation if it's present and isn't buggy.
Object.assign = require('object-assign');

// Without the following stubs, when running component tests, we get...
//  Err : "Cannot read property 'currentProvider' of undefined"
//  Loc : node_modules/origin/dist/index.js:345
//  Ref : http://airbnb.io/enzyme/docs/guides/jsdom.html : "jsdom ~<v10"

import sinon from 'sinon';
const { jsdom } = require('jsdom');
global.window.web3 = sinon.stub();
global.window.web3.currentProvider = sinon.stub();
