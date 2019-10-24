import React from 'react'
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
  Circle
} from 'react-google-maps'

export default withScriptjs(
  withGoogleMap(
    ({
      readonly,
      onMapMonted,
      recalculateCircle,
      defaultZoom,
      defaultCenter,
      markerOptions,
      circleOptions
    }) => {
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
          defaultCenter={{
            lat: defaultCenter.latitude,
            lng: defaultCenter.longitude
          }}
          defaultOptions={options}
          onDrag={recalculateCircle}
          onZoomChanged={recalculateCircle}
        >
          {markerOptions && (
            <Marker
              position={{
                lat: markerOptions.latitude,
                lng: markerOptions.longitude
              }}
            />
          )}
          {circleOptions && (
            <Circle
              center={{
                lat: circleOptions.latitude,
                lng: circleOptions.longitude
              }}
              radius={circleOptions.radius}
              options={{
                strokeColor: '#1a82ff',
                strokeWidth: '10px',
                fillColor: '#1a82ff99'
              }}
            />
          )}
        </GoogleMap>
      )
    }
  )
)
