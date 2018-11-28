import {NativeModules, AsyncStorage} from 'react-native'

const LOCALHOST_SERVER_IP = __DEV__ ? NativeModules.SourceCode.scriptURL.split('://')[1].split('/')[0].split(':')[0] : null

function localfy(str) {
  if (LOCALHOST_SERVER_IP)
  {
    return str.replace("localhost", LOCALHOST_SERVER_IP).replace(/127\.0\.0\.1(?=[^0-9]|$)/, LOCALHOST_SERVER_IP)
  }
  else
  {
    return str
  }
}

function storeData(key, value) {
  AsyncStorage.setItem(key, JSON.stringify(value))
}

function loadData(key) {
  return AsyncStorage.getItem(key).then((data_str) => {
    if (data_str)
    {
      return JSON.parse(data_str)
    }
  })
}

export {localfy, storeData, loadData}
