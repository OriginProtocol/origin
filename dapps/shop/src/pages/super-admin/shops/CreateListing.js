import React from 'react'
import ethers from 'ethers'
import { post } from '@origin/ipfs'
import { useStateValue } from 'data/state'

import useConfig from 'utils/useConfig'
import { createListing } from 'utils/listing'

const CreateListing = ({
  className,
  children,
  onCreated = () => {},
  onError
}) => {
  const { config } = useConfig()
  const [{ admin }] = useStateValue()
  return (
    <button
      type="button"
      className={className}
      onClick={e => {
        e.preventDefault()
        createListing({ config, network: admin.network })
          .then(onCreated)
          .catch(err => onError(err.message))
      }}
      children={children}
    />
  )
}

export default CreateListing
