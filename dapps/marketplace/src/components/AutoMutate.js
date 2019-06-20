import { useEffect } from 'react'

const AutoMutate = ({ mutation }) => {
  useEffect(() => mutation(), [true])
  return null
}

export default AutoMutate
