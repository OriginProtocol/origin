import { LOCAL_DATA_LABELS } from '../../constants/Constants'

async function addLocalDataLabel(_, { objectID, label }) {

  const localData = JSON.parse(
    localStorage.getItem(LOCAL_DATA_LABELS) || '{}'
  )

  const objectData = localData[objectID] ? localData[objectID] : { labels: [] }
  objectData.labels.push(label)
  localData[objectID] = objectData

  localStorage.setItem(LOCAL_DATA_LABELS, JSON.stringify(localData))
}

export default addLocalDataLabel
