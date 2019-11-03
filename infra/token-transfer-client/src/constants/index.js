import moment from 'moment'

export const unlockDate = process.env.UNLOCK_DATE
  ? moment.utc(process.env.UNLOCK_DATE)
  : moment.utc('2020-01-01')

export const apiUrl = process.env.API_URL || 'http://localhost:5000'

export const lockupBonusRate = process.env.LOCKUP_BONUS_RATE || 10.0

