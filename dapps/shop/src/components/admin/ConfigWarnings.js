import React, { useState }  from 'react'

const ConfigWarning = ({ config }) => {
  const [errors, setErrors] = useState([])
  const [isChecked, setIsChecked] = useState(false)
  if(config && (isChecked == false)){
    if(config.stripeKey != undefined){
      errors.push(`
        The 'stripeKey' field has been deprecated in the shop's public config file.
        Please rename this field to 'stripePublishableKey'.`)  
    }
    setErrors(errors)
    setIsChecked(true)
  }
  return <div className="warnings">
    {errors.map((e,i)=><div key={i}>{e}</div>)}
  </div>
}

export default ConfigWarning


require('react-styl')(`

  .warnings > div
    background-color: #ffd1d1
    border-radius: 10px
    padding: 0.75rem
    margin-right: 0.5rem
    margin-bottom: 0.5rem
    margin-top: 1.5rem
`)