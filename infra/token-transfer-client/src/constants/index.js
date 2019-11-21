import {
  earnOgnEnabled,
  lockupBonusRate,
  unlockDate
} from '@origin/token-transfer-server/src/shared'

let apiUrl
if (process.env.NODE_ENV === 'production') {
  if (window.location.hostname.includes('employee')) {
    apiUrl = process.env.EMPLOYEE_API_URL
  } else {
    apiUrl = window.location.origin
  }
} else {
  apiUrl = 'http://localhost:5000'
}

export { apiUrl, earnOgnEnabled, unlockDate, lockupBonusRate }
