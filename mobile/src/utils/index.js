'use strict'

import { Platform } from 'react-native'
import UserAgent from 'react-native-user-agent'

export function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

/* Build a user agent string for the current platform that approximates what
 * would be returned by the standard browser for this device
 */
export function webViewToBrowserUserAgent(useHardcodedUserAgent = false) {
  const DEFAULT_IOS_UA =
    'Mozilla/5.0 (iPhone; CPU iPhone OS 10_1 like Mac OS X) AppleWebKit/602.2.14 (KHTML, like Gecko) Version/10.0 Mobile/14B72 Safari/602.1'
  // Samsung Galaxy s9
  const DEFAULT_ANDROID_UA =
    'Mozilla/5.0 (Linux; Android 8.0.0; SM-G960F Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.84 Mobile Safari/537.36'
  let userAgent = UserAgent.getWebViewUserAgent()
  try {
    if (Platform.OS === 'ios') {
      if (useHardcodedUserAgent) {
        return DEFAULT_IOS_UA
      }

      // Derive a reasonable version number to insert
      const versionMatch = userAgent.match(/OS (\d+)_/)
      const versionCode =
        versionMatch && versionMatch[1] ? `${versionMatch[1]}.0` : '12.0'
      userAgent = userAgent.replace(
        /\) Mobile/,
        `) Version/${versionCode} Mobile`
      )

      const webkitVersionMatch = userAgent.match(/AppleWebKit\/([\d+\\.]+)/)
      const webkitVersion =
        webkitVersionMatch && webkitVersionMatch[1]
          ? webkitVersionMatch[1]
          : '602.1'
      // Insert Safari version that matches the parsed WebKit version
      userAgent = `${userAgent} Safari/${webkitVersion}`
    } else {
      if (useHardcodedUserAgent) {
        return DEFAULT_ANDROID_UA
      }
      // Android
      // Ref: https://developer.chrome.com/multidevice/user-agent#webview_user_agent
      userAgent = userAgent.replace(/ Chrome\/(?:.+) Mobile/, '')
      // Lollipop and above includes an extra ' ;wv' in the string, remove it
      userAgent = userAgent.replace(/; wv/, '')
    }
  } catch (error) {
    // Something went wrong, return a default user agent
    console.debug('Failed parsing UserAgent: ', userAgent)
    userAgent = Platform.OS === 'ios' ? DEFAULT_IOS_UA : DEFAULT_ANDROID_UA
  }
  return userAgent
}
