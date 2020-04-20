import { useEffect, useState } from 'react'
import { useStateValue } from 'data/state'
import useConfig from 'utils/useConfig'

function useAffiliateEarnings() {
  const { config } = useConfig()
  const [loading, setLoading] = useState(false)
  const [earnings, setEarnings] = useState()
  const [{ affiliate }] = useStateValue()

  useEffect(() => {
    if (!affiliate) {
      return
    }
    async function fetchEarnings() {
      setLoading(true)
      fetch(`${config.backend}/affiliate/earnings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `bearer ${config.backendAuthToken}`
        },
        body: JSON.stringify({ msg: affiliate.msg, sig: affiliate.sig })
      }).then(res => {
        setLoading(false)
        if (res.ok) {
          res.json().then(json => setEarnings(json))
        }
      })
    }
    if (!earnings) {
      fetchEarnings()
    }
  }, [affiliate])

  return { earnings: earnings || {}, loading }
}

export default useAffiliateEarnings
