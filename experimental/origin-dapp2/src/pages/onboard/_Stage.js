import React from 'react'

const Stage = ({ stage }) => (
  <div className="stages">
    <div className={`stage${stage >= 1 ? ' active' : ''}`} />
    <div className={`stage${stage >= 2 ? ' active' : ''}`} />
    <div className={`stage${stage >= 3 ? ' active' : ''}`} />
    <div className={`stage${stage >= 4 ? ' active' : ''}`} />
    <div className={`stage${stage >= 5 ? ' active' : ''}`} />
  </div>
)

export default Stage
