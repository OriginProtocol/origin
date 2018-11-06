const userAgent = navigator.userAgent || navigator.vendor || window.opera

export default function isMobile() {
  if (userAgent.match(/Mobi/)) {
    return true
  }

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  if (connection && connection.type === 'cellular') {
    return true
  }

  return false
}

export function mobileDevice() {
  if (/android/i.test(userAgent)) {
    return 'Android'
  } else if (/iPad|iPhone|iPod/.test(userAgent)) {
    return 'iOS'
  } else {
    return null
  }
}
