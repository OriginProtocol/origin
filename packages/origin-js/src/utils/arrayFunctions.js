/**
 * Creates an object composed of keys generated from the results of running
 * each element of `collection` thru `iteratee`.
 *
 * @param  {Array} collection The collection to iterate over.
 * @param  {Function} iteratee The iteratee to transform keys.
 * @return {Object} Returns the composed aggregate object.
 */
function groupBy(collection, iteratee){
  return collection.reduce(function (accumulator, element) {
    const key = iteratee(element)
    accumulator[key] = accumulator[key] || []
    accumulator[key].push(element)
    return accumulator
  }, Object.create(null))
}

/**
* Applies transformation function to values of an object while preserving keys
*
* @param  {Object} object to iterate over
* @param  {Function} mapFunction The functino that transforms the value
* @return {Object} Returns the transformed object
*/
function mapValues(object, mapFunction){
  if (object === null || object === undefined || Object.keys(object).length === 0)
    return {}

  return Object.assign(
    ...Object.keys(object)
      .map(k => ({ [k]: mapFunction(object[k]) }))
  )
}

module.exports = { groupBy, mapValues }
