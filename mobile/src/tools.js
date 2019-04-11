import { AsyncStorage } from 'react-native'

function storeData(key, value) {
  return AsyncStorage.setItem(key, JSON.stringify(value))
}

function loadData(key) {
  return AsyncStorage.getItem(key)
    .then(data => {
      if (data) {
        return JSON.parse(data)
      }
    })
    .catch(error => {
      console.log(`Could not load data for ${key}: ${error}`)
    })
}

function deleteData(key) {
  return AsyncStorage.removeItem(key)
}

export { storeData, loadData, deleteData }
