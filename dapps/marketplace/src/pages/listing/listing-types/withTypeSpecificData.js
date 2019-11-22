import React from 'react'

import withFractionalData from './fractional/withFractionalData'
import withFractionalHourlyData from './fractional-hourly/withFractionalHourlyData'
import withSingleUnitData from './single-unit/withSingleUnitData'
import withMultiUnitData from './multi-unit/withMultiUnitData'

import useListingType from './useListingType'

/**
 * Wraps the component with corresponding listing type's
 * HOC to pass down type specific data as props
 */
const withTypeSpecificData = WrappedComponent => {
  const WithTypeSpecificData = props => {
    const {
      isFractional,
      isFractionalHourly,
      isMultiUnit,
      isService,
      isSingleUnit
    } = useListingType(props.listing)

    let DataComp

    switch (true) {
      case isMultiUnit:
      case isService:
        DataComp = withMultiUnitData(WrappedComponent)
        break

      case isFractional:
        DataComp = withFractionalData(WrappedComponent)
        break

      case isFractionalHourly:
        DataComp = withFractionalHourlyData(WrappedComponent)
        break

      case isSingleUnit:
      default:
        DataComp = withSingleUnitData(WrappedComponent)
    }

    return <DataComp {...props} />
  }

  return WithTypeSpecificData
}

export default withTypeSpecificData
