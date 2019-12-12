import React, { useState, useEffect } from 'react'

import { PARNTER_REFERRAL_CONFIG_URL } from 'constants/config'

let cachedCampaigns = {}

async function fetchConfig() {
  const resp = await fetch(PARNTER_REFERRAL_CONFIG_URL)
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

    useEffect(() => {
      let timeout
      if (cachedCampaigns && Object.keys(cachedCampaigns).length) {
        return
      } else {
        timeout = setTimeout(async () => {
          setPartnerConfig(await fetchConfig())
        }, 3000)
      }

      return () => {
        clearTimeout(timeout)
      }
    }, [])

    return (
      <WrappedComponent
        {...props}
        partnerCampaignConfig={partnerConfig || {}}
      />
    )
  }
  return WithPartnerCampaignConfig
}

export default withPartnerCampaignConfig
