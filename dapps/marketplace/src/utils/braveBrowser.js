export async function detectBraveBrowser() {
  const ua = window.navigator.userAgent.toLowerCase()
  const isChrome = /chrome|crios/.test(ua) && !/edge|opr\//.test(ua)

  // TODO: needs to be implemented
  const testForAdBlocker = false

  const adBlockEnabled = await testForAdBlocker

  const plugins = Array.from(navigator.plugins)
  const zeroPlugins = plugins.length === 0
  const twoSpecificPlugins =
    plugins.length === 2 &&
    plugins.some(plugin => plugin.name === 'Chrome PDF Plugin') &&
    plugins.some(plugin => plugin.name === 'Chrome PDF Viewer')

  if (isChrome && zeroPlugins && adBlockEnabled) {
    return true
  }
  if (isChrome && twoSpecificPlugins) {
    return true
  }

  return false
}
