const CONTENT_CDN = process.env.CONTENT_CDN || ''
const CONTENT_HASH = process.env.CONTENT_HASH || ''
const DATA_DIR = process.env.DATA_DIR || ''

const CDN = CONTENT_CDN.split(',').reduce((m, o) => {
  const [from, to] = o.split('#')
  m[from] = to || from
  return m
}, {})

export default function dataUrl() {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  let dir
  if (pathname.indexOf('/ipfs/') === 0 && CONTENT_HASH) {
    dir = `/ipfs/${CONTENT_HASH}/`
  } else {
    dir = `${CDN[origin] || ''}${DATA_DIR || ''}/`
  }
  return dir
}
