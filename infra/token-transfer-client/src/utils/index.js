import { employeeUnlockDate, investorUnlockDate } from '@/constants'

export const getUnlockDate = user => {
  if (!user) return
  return user.employee ? employeeUnlockDate : investorUnlockDate
}
