export default function getEnvironmentalVar(varName, defaultValue) {
  return typeof process.env[varName] !== 'undefined'
    ? process.env[varName]
    : defaultValue
}
