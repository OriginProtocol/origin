import moment from 'moment'

import {
  earnOgnEnabled,
  lockupBonusRate,
  otcRequestEnabled
} from '@origin/token-transfer-server/src/shared'

let apiUrl
if (process.env.NODE_ENV === 'production') {
  if (window.location.hostname.includes('team')) {
    apiUrl = process.env.TEAM_API_URL
  } else {
    apiUrl = process.env.INVESTOR_API_URL
  }
} else {
  apiUrl = 'http://localhost:5000'
}

let pageTitle
if (window.location.hostname.includes('team')) {
  pageTitle = 'Origin Team Portal'
} else {
  pageTitle = 'Origin Investor Portal'
}

let unlockDate
if (process.env.NODE_ENV === 'production') {
  if (
    window.location.hostname.includes('team') &&
    moment(process.env.TEAM_UNLOCK_DATE, 'YYYY-MM-DD').isValid()
  ) {
    unlockDate = moment.utc(process.env.TEAM_UNLOCK_DATE)
  } else if (moment(process.env.INVESTOR_UNLOCK_DATE, 'YYYY-MM-DD').isValid()) {
    unlockDate = moment.utc(process.env.INVESTOR_UNLOCK_DATE)
  }
}

export {
  apiUrl,
  earnOgnEnabled,
  lockupBonusRate,
  otcRequestEnabled,
  pageTitle,
  unlockDate
}
