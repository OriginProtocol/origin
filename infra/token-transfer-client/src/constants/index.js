import {
  earnOgnEnabled,
  lockupBonusRate,
  otcRequestEnabled,
  unlockDate
} from '@origin/token-transfer-server/src/shared'

let apiUrl
if (process.env.NODE_ENV === 'production') {
  if (window.location.hostname.includes('employee')) {
    apiUrl = process.env.EMPLOYEE_API_URL
  } else {
    apiUrl = process.env.INVESTOR_API_URL
  }
} else {
  apiUrl = 'http://localhost:5000'
}

export {
  apiUrl,
  earnOgnEnabled,
  otcRequestEnabled,
  unlockDate,
  lockupBonusRate
}
