export default function formatPrice(num, opts = {}) {
  if (opts.free && !num) {
    return 'Free'
  }
  return `$${(num / 100).toFixed(2)}`
}
