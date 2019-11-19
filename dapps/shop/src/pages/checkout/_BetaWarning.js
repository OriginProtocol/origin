import React, { useState } from 'react'

const BetaWarning = () => {
  const [cc, setCc] = useState()
  return (
    <div className="alert alert-warning beta-warning">
      <b>Note:</b> This site is in Beta and not yet accepting real credit cards
      or crypto currency. Please use Rinkeby for crypto transactions or click{' '}
      <a
        href="#test"
        onClick={e => {
          e.preventDefault()
          setCc(true)
        }}
      >
        here
      </a>
      {' for a test credit card number.'}
      {!cc ? null : (
        <div className="mt-2">
          Test Credit card: 4111-1111-1111-1111, Exp 11-21, CVC 111
        </div>
      )}
    </div>
  )
}

export default BetaWarning

require('react-styl')(`
  .beta-warning
    margin-top: 2rem
    font-size: 0.875rem
`)
