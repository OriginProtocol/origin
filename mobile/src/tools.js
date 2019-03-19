import {NativeModules, AsyncStorage} from 'react-native'

let REMOTE_LOCAL_SERVER = null
const LOCALHOST_SERVER_IP = __DEV__ ? NativeModules.SourceCode.scriptURL.split('://')[1].split('/')[0].split(':')[0] : null

function setRemoteLocal(server_str) {
  REMOTE_LOCAL_SERVER = server_str
}

function localfy(str) {
  const local_ip = REMOTE_LOCAL_SERVER || LOCALHOST_SERVER_IP

  if (str && local_ip) {
    return str.replace('localhost', local_ip).replace(/127\.0\.0\.1(?=[^0-9]|$)/, local_ip)
  } else {
    return str
  }
}

function storeData(key, value) {
  return AsyncStorage.setItem(key, JSON.stringify(value))
}

function loadData(key) {
  return AsyncStorage.getItem(key).then((data_str) => {
    if (data_str) {
      return JSON.parse(data_str)
    }
  })
}

export { localfy, storeData, loadData, setRemoteLocal }
