import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useSpring, animated } from 'react-spring'

import ProgressBar from './ProgressBar'

const Modal = ({ onClose, onDone, done, error }) => {
  const [show, setShow] = useState(false)

  const bgProps = useSpring({
    config: { duration: 150 },
    opacity: show ? 0.5 : 0
  })

  const modalProps = useSpring({
    config: { mass: 0.75, tension: 300, friction: 20 },
    opacity: show ? 1 : 0,
    transform: show ? 'translate3d(0px,0,0)' : 'translate3d(0,-100px,0)'
  })

  const el = useRef(document.createElement('div'))

  useEffect(() => {
    document.body.appendChild(el.current)
    setShow(true)
    return () => {
      el.current.parentElement.removeChild(el.current)
    }
  }, [el])

  useEffect(() => {
    if (done) {
      setDone(true)
    }
  }, [done])

  const [isDone, setDone] = useState(false)

  const cmp = (
    <>
      <animated.div className="modal-backdrop" style={bgProps} />
      <animated.div
        className={`modal d-block`}
        tabIndex="-1"
        style={modalProps}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Creating your mug...</h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
                onClick={() => {
                  setShow(false)
                  setTimeout(() => {
                    onClose()
                  }, 150)
                }}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <ProgressBar
                delay={300}
                duration={18000}
                className="my-4"
                done={isDone || error}
                barClassName={
                  error
                    ? 'bg-danger'
                    : isDone
                    ? 'bg-success'
                    : 'progress-bar-striped'
                }
                onDone={() => setDone(true)}
              />
            </div>
            <div className="modal-footer">
              {!isDone ? (
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-dismiss="modal"
                  onClick={() => onClose()}
                >
                  Cancel
                </button>
              ) : (
                <button
                  onClick={() => onDone()}
                  type="button"
                  className="btn btn-primary"
                >
                  Show me my mug!
                </button>
              )}
            </div>
          </div>
        </div>
      </animated.div>
    </>
  )

  return createPortal(cmp, el.current)
}

export default Modal
