import React from 'react'
import TooltipTrigger from 'react-popper-tooltip'
// Docs: https://github.com/mohsinulhaq/react-popper-tooltip#props

const Tooltip = ({ tooltip, className = '', children, hideArrow, ...props }) =>
  !tooltip ? (
    children
  ) : (
    <TooltipTrigger
      {...props}
      tooltip={({
        getTooltipProps,
        getArrowProps,
        tooltipRef,
        arrowRef,
        placement
      }) => {
        const props = getTooltipProps({
          ref: tooltipRef,
          className: `tooltip bs-tooltip-${placement} fade show ${className}`
        })
        const arrowProps = getArrowProps({
          ref: arrowRef,
          'data-placement': placement,
          className: 'arrow'
        })
        return (
          <div {...props}>
            {hideArrow ? null : <div {...arrowProps} />}
            <div className="tooltip-inner">{tooltip}</div>
          </div>
        )
      }}
    >
      {({ getTriggerProps, triggerRef }) =>
        React.cloneElement(children, getTriggerProps({ ref: triggerRef }))
      }
    </TooltipTrigger>
  )

export default Tooltip

require('react-styl')(`
  .tooltip
    .tooltip-inner
      background: var(--dark-grey-blue)
      font-size: 14px
      font-weight: normal
      line-height: normal
      padding: 0.75rem
    .arrow::before
      border-top-color: var(--dark-grey-blue)
`)
