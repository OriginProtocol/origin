import React from 'react'
import { withScriptjs, withGoogleMap, GoogleMap, Marker, Circle } from 'react-google-maps'

export default withScriptjs(withGoogleMap(({ readonly, listing, onMapMonted, recalculateCircle, circleCenter, defaultZoom, circleRadius, showMarker, showCircle }) => {
  const { lat, lng } = circleCenter
  const defaultLat = listing.exactLocation.latitude
  const defaultLng = listing.exactLocation.longitude
  let options = {
    zoomControl: false,
    mapTypeControl: false,
    scaleControl: false,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: false
  }

  if (readonly) {
    options = {
      ...options,
      draggable: false,
      scrollwheel: false,
      disableDoubleClickZoom: true
    }
  }

  return (
    <GoogleMap
      ref={onMapMonted}
      defaultZoom={defaultZoom}
      defaultCenter={{ lat, lng }}
      defaultOptions={{
        zoomControl: false,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: false
      }}
      onDrag={recalculateCircle}
      onZoomChanged={recalculateCircle}
    >
      {showMarker && <Marker position={{
        lat: defaultLat,
        lng: defaultLng
      }}/>}
      {showCircle && <Circle
        center={{ lat, lng }}
        radius={circleRadius}
        options={{
          strokeColor: '#1a82ff',
          strokeWidth: '10px',
          fillColor: '#1a82ff99'
        }}
      />}
    </GoogleMap>
  )
}))