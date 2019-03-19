import { useState, useEffect } from 'react'

function calcMobile() {
  return window.innerWidth < 767
}

export default function useMobile() {
  const [isMobile, setMobile] = useState(calcMobile())

  useEffect(() => {
    const handleResize = () => setMobile(calcMobile())
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  })

  return isMobile
}
