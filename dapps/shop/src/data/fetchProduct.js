import memoize from 'lodash/memoize'
import dataUrl from 'utils/dataUrl'

async function fetchProduct(id) {
  const raw = await fetch(`${dataUrl()}${id}/data.json`)
  return await raw.json()
}

export default memoize(fetchProduct)
