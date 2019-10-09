/**
 * IMPORTANT: If you add an entry to an enum below, do not forget to add
 *  a migration script to add the enum to the DB.
 */

const GrowthCampaignRewardStatuses = {
  NotReady: 'NotReady',
  ReadyForCalculation: 'ReadyForCalculation',
  Calculated: 'Calculated',
  Distributed: 'Distributed'
}

module.exports = {
  GrowthCampaignRewardStatuses
}
