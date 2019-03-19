// Based off
// https://developers.google.com/web/ilt/pwa/integrating-analytics

class Analytics {
  constructor() {
    this.trackingId = undefined
  }

  setTrackingId(trackingId) {
    this.trackingId = trackingId
  }

  event(eventCategory, eventAction, eventLabel) {
    'use strict'

    // console.log('Sending analytics event: ' + eventCategory + '/' + eventAction)
    const trackingId = this.trackingId

    if (!trackingId) {
      console.error(
        'GA Tracking Id not set in serviceworker analytics-helper.js'
      )
      // We want this to be a safe method, so avoid throwing unless absolutely necessary.
      return Promise.resolve()
    }

    if (!eventAction && !eventCategory) {
      console.warn(
        'sendAnalyticsEvent() called with no eventAction or eventCategory.'
      )
      // We want this to be a safe method, so avoid throwing unless absolutely necessary.
      return Promise.resolve()
    }

    return self.registration.pushManager
      .getSubscription()
      .then(function(subscription) {
        if (subscription === null) {
          throw new Error('No subscription currently available.')
        }

        // Create hit data
        const payloadData = {
          // Version Number
          v: 1,
          // Client ID
          cid: subscription.endpoint,
          // Tracking ID
          tid: trackingId,
          // Hit Type
          t: 'event',
          // Event Category
          ec: eventCategory,
          // Event Action
          ea: eventAction,
          // Event Label
          el: eventLabel
        }

        // Format hit data into URI
        const payloadString = Object.keys(payloadData)
          .filter(function(analyticsKey) {
            return payloadData[analyticsKey]
          })
          .map(function(analyticsKey) {
            return `${analyticsKey}=${encodeURIComponent(payloadData[analyticsKey])}`
          })
          .join('&')

        // Post to Google Analytics endpoint
        return fetch('https://www.google-analytics.com/collect', {
          method: 'post',
          body: payloadString
        })
      })
      .then(function(response) {
        if (!response.ok) {
          return response.text().then(function(responseText) {
            throw new Error(
              'Bad response from Google Analytics:\n' + response.status
            )
          })
        } else {
          console.log(`🕵 SW: ${eventCategory} ${eventAction}`)
        }
      })
      .catch(function(err) {
        console.warn('Unable to send the analytics event', err)
      })
  }
}

// All we need to do, since this script is included included
// rather than beeing used by a module
analytics = new Analytics()
