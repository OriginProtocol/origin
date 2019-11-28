const totalWithdrawn = async () => {}

const totalLocked = async () => {}

const totalVested = async () => {
  const grants = await Grant.findAll({
    include: [{ model: User }]
  })
  return grants
    .map(grant => vestedAmount(grant.user, grant.get({ plain: true })))
    .reduce((total, vestingAmount) => {
      return total.plus(vestingAmount)
    }, BigNumber(0))
}

module.exports = {
  totalVested
}
