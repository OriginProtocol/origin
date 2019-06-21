export default function formatHash(hash) {
  if (!hash) return ''
  return `${hash.substr(0, 5)}...${hash.substr(-3)}`
}
