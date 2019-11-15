import React, { useState } from 'react'
import { Switch } from 'react-router-dom'

import Modal from '@/components/Modal'
import ScrollToTop from '@/components/ScrollToTop'
import OnboardingRoute from '@/components/OnboardingRoute'
import PrivateRoute from '@/components/PrivateRoute'
import PublicRoute from '@/components/PublicRoute'

// Public routes
import Welcome from '@/components/pages/Welcome'
import RevisedSchedule from '@/components/pages/RevisedSchedule'
import RevisedTerms from '@/components/pages/RevisedTerms'
import Phone from '@/components/pages/Phone'
import Terms from '@/components/pages/Terms'
import Login from '@/components/pages/Login'
import CheckEmail from '@/components/pages/CheckEmail'
import HandleLogin from '@/components/pages/HandleLogin'
import OtpExplain from '@/components/pages/OtpExplain'
import OtpSetup from '@/components/pages/OtpSetup'
import Otp from '@/components/pages/Otp'
// Private routes
import Lockup from '@/components/pages/Lockup'
import LockupConfirm from '@/components/pages/LockupConfirm'
import Dashboard from '@/components/pages/Dashboard'
import News from '@/components/pages/News'
import WithdrawalDetail from '@/components/pages/WithdrawalDetail'
import WithdrawalHistory from '@/components/pages/WithdrawalHistory'
import Security from '@/components/pages/Security'

const App = () => {
  const [displayMobileWarning, setDisplayMobileWarning] = useState(
    window.innerWidth < 768 && !localStorage.getItem('mobileWarningDismissed')
  )

  const dismissMobileWarning = () => {
    localStorage.setItem('mobileWarningDismissed', true)
    setDisplayMobileWarning(false)
  }

  const renderMobileWarning = () => {
    return (
      <Modal appendToId="main" onClose={dismissMobileWarning} closeBtn={true}>
        <h1 className="mb-4">Small Screen</h1>
        <p>
          The Origin Investor Portal is intended to be used with a larger
          screen. Please access your account from a desktop or laptop computer.
        </p>
        <button
          type="submit"
          className="btn btn-primary btn-lg mt-4"
          onClick={dismissMobileWarning}
        >
          Got it
        </button>
      </Modal>
    )
  }

  return (
    <>
      {displayMobileWarning && renderMobileWarning()}
      <ScrollToTop />
      <Switch>
        <PublicRoute path="/login" component={Login} />
        <PublicRoute path="/check_email" component={CheckEmail} />
        <PublicRoute path="/login_handler/:token" component={HandleLogin} />
        <PublicRoute path="/otp/explain" component={OtpExplain} />
        <PublicRoute exact path="/otp" component={Otp} />
        <OnboardingRoute exact path="/welcome" component={Welcome} />
        <OnboardingRoute
          exact
          path="/revised_schedule"
          component={RevisedSchedule}
        />
        <OnboardingRoute exact path="/revised_terms" component={RevisedTerms} />
        <OnboardingRoute exact path="/terms" component={Terms} />
        <OnboardingRoute exact path="/phone" component={Phone} />
        <OnboardingRoute path="/otp/setup" component={OtpSetup} />
        <PrivateRoute exact path="/" component={Dashboard} />
        <PrivateRoute path="/news" component={News} />
        <PrivateRoute exact path="/lockup" component={Lockup} />
        <PrivateRoute path="/lockup/:id/:token" component={LockupConfirm} />
        <PrivateRoute exact path="/withdrawal" component={WithdrawalHistory} />
        <PrivateRoute
          path="/withdrawal/:id/:token?"
          component={WithdrawalDetail}
        />
        <PrivateRoute path="/security" component={Security} />
      </Switch>
    </>
  )
}

export default App
