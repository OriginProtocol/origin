import React, { useState, useEffect } from 'react'

import { PARNTER_REFERRAL_CONFIG_URL } from 'constants/config'

let cachedCampaigns = {}

async function fetchConfig(signal) {
  if (Object.keys(cachedCampaigns).length) {
    return cachedCampaigns
  }

  const resp = await fetch(PARNTER_REFERRAL_CONFIG_URL, { signal })
  if (resp.status !== 200) {
    console.error('Failed to fetch campaign config')
    return
  }
  cachedCampaigns = await resp.json()
  return cachedCampaigns
}

function withPartnerCampaignConfig(WrappedComponent) {
  const WithPartnerCampaignConfig = props => {
    const [partnerConfig, setPartnerConfig] = useState(cachedCampaigns)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      const abortController = new AbortController()

      fetchConfig(abortController.signal)
        .then(data => {
          setPartnerConfig(data)
          setLoading(false)
        })
        .catch(() => {
          // Probably aborted, do nothing
        })

      return () => abortController.abort()
    }, [])

    return (
      <WrappedComponent
        {...props}
        partnerCampaignLoading={loading}
        partnerCampaignConfig={partnerConfig || {}}
      />
    )
  }
  return WithPartnerCampaignConfig
}

export default withPartnerCampaignConfig
