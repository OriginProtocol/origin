import React, { useEffect, useRef, useState } from 'react'
import Chartist from 'chartist'
import { createPopper } from '@popperjs/core'
import 'chartist/dist/scss/chartist.scss'
import groupBy from 'lodash/groupBy'
import get from 'lodash/get'
import dayjs from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'
dayjs.extend(advancedFormat)

const Chart = ({ orders = [], numDays = 10 }) => {
  const chartEl = useRef()
  const popover = useRef()
  const arrow = useRef()
  const [tooltip, setTooltip] = useState()

  useEffect(() => {
    const days = Array(numDays)
      .fill(0)
      .map((i, idx) => dayjs().subtract(idx, 'days'))
      .reverse()

    const labels = [...days.map(d => d.format('ddd Do')).slice(0, numDays - 1), 'Today']

    const byDay = groupBy(orders, o => dayjs(o.createdAt).format('YYYY-MM-DD'))
    const seriesRaw = days.map(d => {
      const day = dayjs(d).format('YYYY-MM-DD')
      return get(byDay, `[${day}].length`, 0)
    })
    const series = [seriesRaw]

    const chart = new Chartist.Bar(
      chartEl.current,
      { labels, series },
      { axisY: { offset: 20 }, axisX: { showGrid: false } }
    )

    chart.on('draw', function(data) {
      if (data.type === 'bar') {
        const node = data.element.getNode()
        let instance
        node.addEventListener('mouseleave', () => {
          instance.destroy()
          setTooltip(null)
        })
        node.addEventListener('mouseenter', () => {
          setTooltip(`Orders: ${data.value.y}`)
          instance = createPopper(node, popover.current, {
            placement: 'top',
            modifiers: [{ name: 'arrow', options: { element: arrow.current } }]
          })
        })
      }
    })
  }, [orders])

  return (
    <>
      <h5>{`Orders last ${numDays} days`}</h5>
      <div className="chart" ref={chartEl} />
      {!tooltip ? null : (
        <div ref={popover} className="tooltip bs-tooltip-top">
          <div ref={arrow} className="arrow"></div>
          <div className="tooltip-inner">{tooltip}</div>
        </div>
      )}
    </>
  )
}

export default Chart

require('react-styl')(`
  .admin .chart
    max-width: 600px
  .ct-bar
    stroke: #3b80ee !important
    stroke-width: 2rem
  .tooltip
    opacity: 1
`)
