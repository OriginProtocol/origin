const userAgent = navigator.userAgent || navigator.vendor || window.opera

export function mobileDevice() {
  const unrecognized = 'Unknown Mobile'

  if (userAgent.match(/android/i)) {
    return 'Android'
  } else if (userAgent.match(/iPad|iPhone|iPod/)) {
    return 'iOS'
  } else if (userAgent.match(/Mobi/)) {
    return unrecognized
  } else {
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection ||
      {}

    return connection.type === 'cellular' ? unrecognized : null
  }
}
