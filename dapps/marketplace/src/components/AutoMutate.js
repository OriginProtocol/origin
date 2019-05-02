import { useEffect } from 'react'

const AutoMutate = ({ mutatation }) => {
  useEffect(() => mutatation(), [true])
  return null
}

export default AutoMutate
