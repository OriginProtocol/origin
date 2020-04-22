import React, { useState, useRef } from 'react'
import { createPopper } from '@popperjs/core'
import { useEffect } from 'react'

const Popover = ({
  button,
  children,
  className,
  onClose = () => {},
  onOpen = () => {}
}) => {
  const [open, setOpen] = useState(false)
  const [popper, setPopper] = useState()

  const btn = useRef()
  const popover = useRef()
  const arrow = useRef()

  useEffect(() => {
    const listener = event => {
      if (!popover.current || popover.current.contains(event.target)) {
        return
      }
      if (!btn.current || btn.current.contains(event.target)) {
        return
      }
      setOpen(false)
      onClose()
    }

    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)

    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [])

  useEffect(() => {
    if (open) {
      const instance = createPopper(btn.current, popover.current, {
        placement: 'bottom',
        modifiers: [
          { name: 'offset', options: { offset: [0, 8] } },
          { name: 'arrow', options: { element: arrow.current } }
        ]
      })
      setPopper(instance)
    } else if (popper) {
      popper.destroy()
    }
    return () => {
      if (popper) {
        popper.destroy()
      }
    }
  }, [open, popover])
  return (
    <>
      <button
        ref={btn}
        className={className}
        onClick={() => {
          setOpen(!open)
          open ? onClose() : onOpen()
        }}
      >
        {button}
      </button>
      {!open ? null : (
        <div ref={popover} className="popover bs-popover-bottom m-0">
          <div ref={arrow} className="arrow"></div>
          {children}
        </div>
      )}
    </>
  )
}

export default Popover

require('react-styl')(`
  .popover
    box-shadow: 0 2px 14px 0 rgba(0, 0, 0, 0.5)
    padding: 0.5rem
`)
