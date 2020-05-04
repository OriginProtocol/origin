import React, { useState, useEffect } from 'react'

import { useStateValue } from 'data/state'

import { DshopLogo } from 'components/icons/Admin'

import Login from './Login'
import SignUp from './SignUp'
import ServerSetup from './ServerSetup'
import CreateShop from './CreateShop'
import ShopReady from './ShopReady'

const FirstTime = () => {
  const [{ admin }] = useStateValue()
  const [step, setStep] = useState('no-shops')
  const [ready, setReady] = useState()
  // const [error, setError] = useState()

  useEffect(() => {
    if (admin.reason === 'no-active-network') {
      setStep('server-setup')
    } else if (admin.reason === 'no-shops' || admin.reason === 'no-shop') {
      setStep('create-shop')
    } else if (admin.reason === 'no-users') {
      setStep('sign-up')
    } else if (admin.reason) {
      setStep('login')
      // setError(admin.reason)
    }
  }, [admin.reason])

  if (!step) {
    return null
  }

  return (
    <div className="container admin-first-time">
      <DshopLogo />
      {/* {error ? <div>{error}</div> : null} */}
      {step === 'sign-up' ? (
        <SignUp next={() => setStep('server-setup')} />
      ) : step === 'login' ? (
        <Login />
      ) : step === 'server-setup' ? (
        <ServerSetup next={() => setStep('create-shop')} />
      ) : step === 'shop-deployed' ? (
        <ShopReady {...ready} />
      ) : (
        <CreateShop
          next={ready => {
            setReady(ready)
            setStep('shop-deployed')
          }}
        />
      )}
    </div>
  )
}

export default FirstTime

require('react-styl')(`
  .admin-first-time
    display: flex
    flex-direction: column
    justify-content: center
    align-items: center
    margin-top: 4rem
    margin-bottom: 4rem
    a
      color: #3b80ee
    svg
      width: 180px
      fill: #333
      margin-bottom: 2rem
    .sign-up
      display: flex
      flex-direction: column
`)
