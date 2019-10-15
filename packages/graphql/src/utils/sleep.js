export default function sleep(timeInMs) {
  return new Promise(resolve => setTimeout(resolve, timeInMs))
}
