export default function formatPrice(num) {
  return `$${(num / 100).toFixed(2)}`
}
