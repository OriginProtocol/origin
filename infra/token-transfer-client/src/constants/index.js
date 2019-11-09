import {
  employeeUnlockDate,
  investorUnlockDate,
  lockupBonusRate
} from '@origin/token-transfer-server/src/shared'

const apiUrl = process.env.API_URL || 'http://localhost:5000'

export { apiUrl, employeeUnlockDate, investorUnlockDate, lockupBonusRate }
