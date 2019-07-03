import { LOCAL_DATA_LABELS } from '../constants/Constants'

async function getLocalDataLabels(objectId) {

  const localData = JSON.parse(
    localStorage.getItem(LOCAL_DATA_LABELS) || '{}'
  )

  const objectData = localData[objectId] ? localData[objectId] : { labels: [] }
  return objectData.labels
}

export default getLocalDataLabels
