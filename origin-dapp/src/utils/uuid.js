/*
 * UUID Generator
 * @description - Genrates a unique ID that complies with RFC4122 version 4
 * @returns - an ID. Example: fbb744fa-e7af-4995-9cdb-d40b26ded597
 */

export default () => {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}
