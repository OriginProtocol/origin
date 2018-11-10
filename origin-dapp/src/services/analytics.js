const gaTrackingId = process.env.GA_TRACKING_ID || 'UA-106384880-2'
const gtag = window.gtag || function() {}

/**
 * Records an analytics event
 * @param {string} category Type of ojbect this event is about
 * @param {string} action Verb of the action taken that fired this event
 * @param {string} [label=undefined]
 * @param {number} [value=undefined]
 */
export function event(category, action, label, value) {
  const gtag = window.gtag || function() {}
  gtag('send', { category, action, label, value })
}
