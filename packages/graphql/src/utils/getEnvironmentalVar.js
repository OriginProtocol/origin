export default function getEnvironmentalVar(varName, defaultValue) {
  return typeof process.env[varName] !== 'undefined'
    ? parseInt(process.env[varName])
    : defaultValue
}
