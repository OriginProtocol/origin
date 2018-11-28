const gaTrackingId = process.env.GA_TRACKING_ID || 'UA-106384880-2'

/**
 * Records an analytics event
 * @param {string} category Type of object this event is about
 * @param {string} action Verb of the action taken that fired this event
 * @param {string} [label=undefined]
 * @param {number} [value=undefined]
 */
function event(category, action, label, value) {
  const gtag = window.gtag || function() {}
  if (process.env.NODE_ENV == 'development') {
    console.log(`🕵 ${category} ${action} ${label==undefined?label:''}`)
  }
  
  gtag('send', { category, action, label, value })
}

export default {
  event: event,
  gaTrackingId: gaTrackingId 
}
