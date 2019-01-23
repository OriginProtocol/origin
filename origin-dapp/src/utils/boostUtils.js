export const defaultBoostValue = 50
export const minBoostValue = 0
/* If this value changes from 100 to another value, the boost ranking search function needs to be updated as well.
 * See this document: https://docs.google.com/spreadsheets/d/1bgBlwWvYL7kgAb8aUH4cwDtTHQuFThQ4BCp870O-zEs/edit#gid=0
 * and do the required changes.
 */
export const maxBoostValue = 100
const range = maxBoostValue - minBoostValue

export const boostLevels = {
  None: {
    min: 0,
    max: 0,
    desc: 'Your listing will get very low visibility.'
  },
  Low: {
    min: minBoostValue + 1,
    max: range / 4,
    desc: 'Your listing will get below-average visibility.'
  },
  Medium: {
    min: range / 4 + 1,
    max: range / 2,
    desc: 'Your listing will get average visibility.'
  },
  High: {
    min: range / 2 + 1,
    max: (range / 4) * 3,
    desc: 'Your listing will get above-average visibility.'
  },
  Premium: {
    min: (range / 4) * 3 + 1,
    max: maxBoostValue,
    desc: 'Your listing will get the best visibility.'
  }
}

/*
 * getBoostLevel
 *
 * @description determines the name of the boost level when given a boost value
 * @param {number} value - the number of OGN that has is being offered for the boost
 * @return {string} - the name of the boost level (Low, Medium, Premium, etc.)
 */

export function getBoostLevel(value) {
  if (!value) {
    value = 0
  }

  for (const levelName in boostLevels) {
    const thisLevel = boostLevels[levelName]
    if (value >= thisLevel.min && value <= thisLevel.max) {
      return levelName.toString()
    }
  }
}
