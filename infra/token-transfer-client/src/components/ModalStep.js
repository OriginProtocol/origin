import React from 'react'

const ModalStep = ({ steps, completedSteps }) => {
  const renderStep = i => {
    const isCompleted = i <= completedSteps - 1
    return (
      <div
        className={`step${isCompleted ? ' bg-green' : ''}${
          i === 0 ? ' rounded-left' : ''
        }${i === steps - 1 ? ' rounded-right' : ''}`}
        key={i}
      ></div>
    )
  }

  return [...Array(steps).keys()].map(renderStep)
}

export default ModalStep
