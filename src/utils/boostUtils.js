const min = 0
const max = 100
const range = max - min

export const defaultBoostValue = 50

export const boostLevels = {
  None: {
    min: 0,
    max: 0,
    desc: 'Your listing will get very low visibility and no seller guarantee'
  },
  Low: {
    min: min + 1,
    max: (range / 4),
    desc: 'Your listing will get below average visibility and low seller guarantee'
  },
  Medium: {
    min: range / 4 + 1,
    max: (range / 2),
    desc: 'Your listing will get average visibility and good seller guarantee'
  },
  High: {
    min: range / 2 + 1,
    max: ((range / 4) * 3),
    desc: 'Your listing will get above average visibility and excellent seller guarantee'
  },
  Premium: {
    min: (range / 4) * 3 + 1,
    max: max,
    desc: 'Your listing will get the best visibility and highest seller guarantee'
  }
}

/*
 * getBoostLevel
 *
 * @description determines the name of the boost level when given a boost value
 * @param {number} value - the number of OGN that has is being offered for the boost
 * @return {string} - the name of the boost level (Low, Medium, Premium, etc.)
 */

export const getBoostLevel = (value) => {
  if (!value) {
    value = 0
  }

  if (typeof value === 'string') {
    value = parseFloat(value)
  }

  for (const levelName in boostLevels) {
    const thisLevel = boostLevels[levelName]
    if (value >= thisLevel.min && value <= thisLevel.max) {
      return levelName.toString()
    }
  }
}
