import React from 'react'

const Price = ({ price: { currency, amount } }) => {
  if (currency.code === 'USD') {
    return <span>{`$${amount}`}</span>
  }
  return <span>{`${amount} ${currency.code}`}</span>
}

export default Price
