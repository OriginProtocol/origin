export function getStorageItem(key, defaultValue) {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (e) {
    return defaultValue
  }
}

export function saveStorageItem(key, item, defaultValue) {
  try {
    localStorage.setItem(key, JSON.stringify(item))
  } catch (e) {
    return defaultValue || item
  }
  return item
}
