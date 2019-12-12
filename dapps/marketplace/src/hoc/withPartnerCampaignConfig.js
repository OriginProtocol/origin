import React, { useState, useEffect } from 'react'

import { PARNTER_REFERRAL_CONFIG_URL } from 'constants/config'

let cachedCampaigns

function withPartnerCampaignConfig(WrappedComponent) {
  const WithPartnerCampaignConfig = props => {
    const [partnerConfig, setPartnerConfig] = useState(cachedCampaigns)

    useEffect(() => {
      let timeout
      if (cachedCampaigns) {
        return
      } else {
        setTimeout(async () => {
          const resp = await fetch(PARNTER_REFERRAL_CONFIG_URL)
          if (resp !== 200) {
            console.error('Failed to fetch campaign config')
            return
          }
          const jason = await resp.json()
          setPartnerConfig(jason)
        }, 3000)
      }

      return () => {
        clearTimeout(timeout)
      }
    })

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
