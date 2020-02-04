import React, { useEffect, useState } from 'react'
import { useStoreState } from 'pullstate'
import { get } from 'lodash'

import Email from 'components/Edit/DeployWizard/Email'
import Password from 'components/Edit/DeployWizard/Password'
import Listing from 'components/Edit/DeployWizard/Listing'
import Complete from 'components/Edit/DeployWizard/Complete'
import Loading from 'components/Loading'
import store from '@/store'

const Deploy = () => {
  const [step, setStep] = useState(null)
  const [loading, setLoading] = useState(true)
  const ethNetworkId = Number(web3.currentProvider.chainId)

  const settings = useStoreState(store, s => s.settings)
  const backend = useStoreState(store, s => s.backend)

  useEffect(() => {
    if (nextStep()) setLoading(false)
  }, [backend, settings])

  const nextStep = () => {
    if (!backend.email) {
      setStep('Email')
    } else if (!backend.password) {
      setStep('Password')
    } else if (!get(settings, `networks[${ethNetworkId}].listingId`)) {
      setStep('Listing')
    } else {
      setStep('Complete')
    }
    return true
  }

  if (loading) {
    return <Loading />
  }

  return (
    <>
      <div className="d-flex justify-content-between">
        <h3>Deploy</h3>
      </div>
      {step === 'Email' && <Email />}
      {step === 'Password' && <Password />}
      {step === 'Listing' && <Listing ethNetworkId={ethNetworkId} />}
      {step === 'Complete' && <Complete ethNetworkId={ethNetworkId} />}
    </>
  )
}

export default Deploy
