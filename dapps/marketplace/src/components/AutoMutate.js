import { useEffect } from 'react'

const AutoMutate = ({ mutatation }) => {
  useEffect(() => mutatation())
  return null
}

export default AutoMutate
