export default function isMobile() {
  if (navigator.userAgent.match(/Mobi/)) {
    return true
  }

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  if (connection && connection.type === 'cellular') {
    return true
  }

  if ('screen' in window && window.screen.width <= 1366) {
    return true
  }

  return false
}
